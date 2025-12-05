import type { Route } from '@/types';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/popular/all/:embed?',
    categories: ['social-media'],
    example: '/bilibili/popular/all',
    parameters: {
        embed: '默认为开启内嵌视频, 任意值为关闭',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '综合热门',
    maintainers: ['ziminliu'],
    handler,
};

async function handler(ctx) {
    const embed = !ctx.req.param('embed');
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/popular`,
        headers: {
            Referer: 'https://www.bilibili.com/',
        },
    });
    const list = response.data.data.list;

    return {
        title: `bilibili 综合热门`,
        link: 'https://www.bilibili.com',
        description: `bilibili 综合热门`,
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                description: utils.renderUGCDescription(embed, item.pic, item.desc, item.aid, undefined, item.bvid),
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
            })),
    };
}
