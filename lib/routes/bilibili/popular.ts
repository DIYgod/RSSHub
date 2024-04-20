import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/popular/all',
    categories: ['social-media'],
    example: '/bilibili/popular/all',
    parameters: {},
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
    const disableEmbed = ctx.req.param('disableEmbed');
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
                description: `${item.desc}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
            })),
    };
}
