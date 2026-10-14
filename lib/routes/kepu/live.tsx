import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/live',
    categories: ['new-media'],
    example: '/kepu/live',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['live.kepu.net.cn/replay/index'],
        },
    ],
    name: '直播回看',
    maintainers: ['nczitzk'],
    handler,
    url: 'live.kepu.net.cn/replay/index',
};

type ReplayItem = DataItem & { guid: string; link: string; description: string; itunes_item_image: string };

function getReplayMedia(url?: string): { url?: string; mimeType?: string } {
    if (!url) {
        return {};
    }
    try {
        const mediaUrl = new URL(url);
        if (!['http:', 'https:'].includes(mediaUrl.protocol) || mediaUrl.username || mediaUrl.password) {
            return {};
        }
        const extension = mediaUrl.pathname.split('.').at(-1)?.toLowerCase();
        return { url: mediaUrl.href, mimeType: extension === 'mp4' ? 'video/mp4' : extension === 'webm' ? 'video/webm' : undefined };
    } catch {
        return {};
    }
}

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 50);

    const rootUrl = 'https://live.kepu.net.cn';
    const apiRootUrl = 'https://live.kepu.net.cn:8089';

    const currentUrl = new URL('replay/index', rootUrl).href;
    const apiUrl = new URL('index.php/front/index/replay_list', apiRootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            page: 1,
            size: limit,
        },
    });

    let items: ReplayItem[] = response.data.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`live/index?id=${item.id}`, rootUrl).href,
        description: item.desc,
        author: item.company,
        guid: item.id,
        pubDate: timezone(parseDate(item.live_start_time ?? item.start_time), 8),
        updated: timezone(parseDate(item.live_end_time ?? item.end_time), 8),
        itunes_item_image: new URL(item.cover, apiRootUrl).href,
        comments: item.display_comment ?? 0,
    }));

    items = await pMap(
        items,
        async (item) => {
            let detail: { enclosureUrl?: string } = {};
            try {
                detail = await cache.tryGet<{ enclosureUrl?: string }>(`kepu:replay:${item.link}`, async () => {
                    const apiReplayUrl = new URL('index.php/front/live/replay_url', apiRootUrl).href;

                    const { data: detailResponse } = await got.post(apiReplayUrl, {
                        form: {
                            id: item.guid,
                        },
                    });

                    return { enclosureUrl: detailResponse.data.RecordIndexInfoList.RecordIndexInfo.at(-1)?.RecordUrl };
                });
            } catch (error) {
                if (!(error instanceof FetchError) || error.statusCode !== 500) {
                    throw error;
                }
                // Retain the public replay card when its media endpoint is unavailable.
            }
            const media = getReplayMedia(detail.enclosureUrl);
            return {
                ...item,
                guid: `kepu-live#${item.guid}`,
                enclosure_url: media.mimeType ? media.url : undefined,
                enclosure_type: media.mimeType,
                description: renderToString(
                    <>
                        {item.itunes_item_image && !media.url ? (
                            <figure>
                                <img src={item.itunes_item_image} alt={item.title} />
                            </figure>
                        ) : null}
                        {media.url ? (
                            <video poster={item.itunes_item_image} controls>
                                <source src={media.url} type={media.mimeType} />
                                <object data={media.url}>
                                    <embed src={media.url} />
                                </object>
                            </video>
                        ) : null}
                        {item.description ? <p>{item.description}</p> : null}
                    </>
                ),
            };
        },
        { concurrency: 3 }
    );

    const icon = new URL('favicon.ico', rootUrl).href;
    const author = '中国科普博览';
    const subtitle = '直播回看';

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: '科学直播(live.kepu.net.cn)',
        language: 'zh' as const,
        icon,
        logo: icon,
        subtitle,
        author,
        itunes_author: author,
        itunes_category: 'Science',
        allowEmpty: true,
    };
}
