import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/kg/reply/:playId',
    categories: ['social-media'],
    example: '/qq/kg/reply/OhXHMdO1VxLWQOOm',
    parameters: { playId: '音频页 ID, 可在对应页面的 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户作品评论动态',
    maintainers: ['zhangxiang012'],
    handler,
};

async function handler(ctx) {
    const playId = ctx.req.param('playId');
    const url = `https://node.kg.qq.com/play?s=${playId}`;
    const play_item = await cache.getPlayInfo(ctx, playId, '');

    return {
        title: `${play_item.name} - ${play_item.author} 的评论`,
        link: url,
        image: play_item.itunes_item_image,
        allowEmpty: true,
        item: play_item.comments.map((item) => ({
            title: `${item.nick}：${item.content}`,
            pubDate: parseDate(item.ctime * 1000),
            link: url,
            guid: `ksong:${play_item.ksong_mid}:${item.comment_id}`,
        })),
    };
}
