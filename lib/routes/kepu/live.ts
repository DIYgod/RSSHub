import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/live',
    categories: ['new-media'],
    example: '/kepu/live',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
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

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

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

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`live/index?id=${item.id}`, rootUrl).href,
        description: item.desc,
        author: item.company,
        guid: item.id,
        pubDate: timezone(parseDate(item.live_start_time ?? item.start_time), +8),
        updated: timezone(parseDate(item.live_end_time ?? item.end_time), +8),
        itunes_item_image: new URL(item.cover, apiRootUrl).href,
        comments: item.display_comment ?? 0,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const apiReplayUrl = new URL('index.php/front/live/replay_url', apiRootUrl).href;

                const { data: detailResponse } = await got.post(apiReplayUrl, {
                    form: {
                        id: item.guid,
                    },
                });

                item.guid = `kepu-live#${item.guid}`;
                item.enclosure_url = detailResponse.data.RecordIndexInfoList.RecordIndexInfo.pop()?.RecordUrl;

                if (item.enclosure_url) {
                    item.enclosure_type = `video/${item.enclosure_url.split(/\./).pop()}`;
                }

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: item.itunes_item_image,
                        alt: item.title,
                    },
                    video: {
                        src: item.enclosure_url,
                        type: item.enclosure_type,
                        poster: item.itunes_item_image,
                    },
                    description: item.description,
                });

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;
    const author = '中国科普博览';
    const subtitle = '直播回看';

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: '科学直播(live.kepu.net.cn)',
        language: 'zh',
        icon,
        logo: icon,
        subtitle,
        author,
        itunes_author: author,
        itunes_category: 'Science',
        allowEmpty: true,
    };
}
