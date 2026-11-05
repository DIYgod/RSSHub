import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const types = {
    0: '动态',
    7: '书评',
    12: '视频',
};

const mentionPattern = /<\u{2267}\u{2746}>\{"name":"(.*?)","uid":"\d+","at":"1"\}<\/\u{2266}\u{2746}>/gu;

const formatNoteText = (text = '') => text.replaceAll('\n\n', '</p><p>').replaceAll(mentionPattern, ' @$1');

const extractImageUrl = (value?: string) => value?.match(/"url":"(.*?)"/)?.[1];

const getVideoUrl = (link: string) =>
    cache.tryGet(`dedao:video:${link}`, async () => {
        const response = await ofetch(link);
        const $ = load(response);
        const state = $('script')
            .toArray()
            .map((script) => $(script).text())
            .find((script) => script.includes('window.__INITIAL_STATE__'));
        const videoUrl = state ? JSON.parse(state.replace(/^\s*window\.__INITIAL_STATE__\s*=\s*/, '').replace(/;\s*$/, '')).noteDetail?.video?.video_url : undefined;
        if (!videoUrl) {
            throw new Error(`No public video playback URL found on ${link}.`);
        }
        return videoUrl as string;
    });

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['new-media'],
    example: '/dedao/user/VkA5OqLX4RyGxmZRNBMlwBrDaJQ9og',
    parameters: { id: '用户 id，可在对应用户主页 URL 中找到', type: '类型，见下表，默认为`0`，即动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户主页',
    maintainers: ['nczitzk'],
    handler,
    description: `| 动态 | 书评 | 视频 |
| ---- | ---- | ---- |
| 0    | 7    | 12   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';
    const type = ctx.req.param('type') ? Number.parseInt(ctx.req.param('type')) : 0;
    const count = getRouteLimit(ctx, 100);

    const rootUrl = 'https://m.igetget.com';
    const currentUrl = `${rootUrl}/native/mine/account#/user/detail?enId=${id}`;
    const apiUrl = `${rootUrl}/native/api/homePage/topicNote`;
    const infoUrl = `${rootUrl}/native/api/homePage/userInfo`;

    const detailResponse = await got({
        method: 'post',
        url: infoUrl,
        json: {
            hazy: id,
        },
    });

    const data = detailResponse.data;

    const author = data.c.nickname;
    const image = data.c.avatar;
    const description = `${data.c.v_info}: ${data.c.slogan}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            uid: null,
            max_id_str: '0',
            count,
            max_createtime: 0,
            is_only_repost: 0,
            load_chain: true,
            load_tag: 1,
            source: 0,
            note_type: type,
            only_origin: false,
            with_highlight: true,
            hazy: id,
        },
    });

    const items = await pMap(
        response.data.c.list,
        async (item: (typeof response.data.c.list)[number]) => {
            const videoUrl = item.video.video_id ? await getVideoUrl(item.share_url) : undefined;
            return {
                author,
                title: item.content || item.note || item.extra.title,
                link: item.share_url,
                pubDate: parseDate(item.create_time * 1000),
                description: renderToString(
                    <>
                        {item.origin_notes_owner.name ? (
                            <>
                                <p>{raw(formatNoteText(item.content))}</p>
                                <br />
                                <p>
                                    引用 {item.origin_notes_owner.name}
                                    {item.origin_notes_owner.Vinfo ? ` (${item.origin_notes_owner.Vinfo})` : ''}:
                                </p>
                            </>
                        ) : null}
                        <p>{raw(formatNoteText(item.note))}</p>
                        {item.extra ? (
                            <>
                                <br />
                                {item.extra.img ? (
                                    item.extra.share_ext ? (
                                        <a href={item.extra.share_ext.h_5_url}>
                                            <figure>
                                                <img src={item.extra.img} />
                                                <figcaption>{item.extra.title}</figcaption>
                                            </figure>
                                        </a>
                                    ) : (
                                        <figure>
                                            <img src={item.extra.img} />
                                            <figcaption>{item.extra.title}</figcaption>
                                        </figure>
                                    )
                                ) : null}
                                {item.extra.images
                                    ? item.extra.images.map((image) => {
                                          const imageUrl = extractImageUrl(image);
                                          return imageUrl ? <img src={imageUrl} /> : null;
                                      })
                                    : null}
                                {item.video.video_cover
                                    ? (() => {
                                          const imageUrl = extractImageUrl(item.video.video_cover);
                                          return videoUrl ? (
                                              <video controls src={videoUrl} poster={imageUrl} />
                                          ) : imageUrl ? (
                                              <figure>
                                                  <img src={imageUrl} />
                                              </figure>
                                          ) : null;
                                      })()
                                    : null}
                            </>
                        ) : null}
                    </>
                ),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${author}的得到主页 - ${types[type]}`,
        link: currentUrl,
        item: items,
        image,
        description,
        allowEmpty: true,
    };
}
