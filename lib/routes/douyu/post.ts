import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/post/:id',
    categories: ['bbs'],
    example: '/douyu/post/631737151576473201',
    parameters: { id: '帖子 id，可在帖子页 URL 中找到' },
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
            source: ['yuba.douyu.com/p/:id', 'yuba.douyu.com/'],
        },
    ],
    name: '鱼吧跟帖',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://yuba.douyu.com';
    const currentUrl = `${rootUrl}/p/${id}`;
    const detailUrl = `${rootUrl}/wbapi/web/post/detail/${id}`;

    const detailResponse = await got({
        method: 'get',
        url: detailUrl,
    });

    const data = detailResponse.data.data;
    let apiUrl = `${rootUrl}/wbapi/web/post/comments/${id}?group_id=${data.group_id}&sink=1&page=1`;

    let response = await got({
        method: 'get',
        url: apiUrl,
    });

    apiUrl = `${rootUrl}/wbapi/web/post/comments/${id}?group_id=${data.group_id}&sink=1&page=${response.data.page_total}`;

    response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.map((item) => ({
        title: `${item.nick_name}: ${item.content}`,
        link: `${currentUrl}#${item.comment_id}${item.sub_replies.length > 0 ? `+${item.sub_replies.map((r) => r.comment_id).join('+')}` : ''}`,
        pubDate: parseDate(item.created_ts * 1000),
        description: art(path.join(__dirname, 'templates/description.art'), {
            content: item.content,
            images: item.imglist.map((i) => ({
                size: i.size,
                url: i.url,
            })),
            replies:
                item.sub_replies.map((r) => ({
                    nickname: r.nickname,
                    content: r.content,
                    time: new Date(r.created_ts * 1000).toLocaleString(),
                })) ?? undefined,
        }),
    }));

    return {
        title: `斗鱼鱼吧 - ${data.title}`,
        link: currentUrl,
        item: items,
        description: data.content,
    };
}
