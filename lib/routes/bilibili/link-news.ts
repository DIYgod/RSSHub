import type { Route } from '@/types';
import { distinguishDuplicateGuids } from '@/utils/distinguish-duplicate-guids';
import got from '@/utils/got';

export const route: Route = {
    path: '/link/news/:product',
    categories: ['social-media'],
    example: '/bilibili/link/news/live',
    parameters: { product: '公告分类, 包括 直播:live 小视频:vc 相簿:wh' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'link 公告',
    maintainers: ['Qixingchen'],
    handler,
};

async function handler(ctx) {
    const product = ctx.req.param('product');

    let productTitle: string;

    switch (product) {
        case 'live':
            productTitle = '直播';
            break;
        case 'vc':
            productTitle = '小视频';
            break;
        case 'wh':
            productTitle = '相簿';
            break;
        default:
            throw new Error(`Unknown product: ${product}`);
    }

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/news/v1/notice/list?platform=pc&product=${product}&category=all&page_no=1&page_size=20`,
        headers: {
            Referer: 'https://link.bilibili.com/p/eden/news',
        },
    });
    const data = response.data.data.items;
    const link = `https://link.bilibili.com/p/eden/news#/?tab=${product}&tag=all&page_no=1`;
    const items = data?.map((item) => ({
        title: item.title,
        description: `${item.mark}<br><img src="${item.cover_url}">`,
        pubDate: new Date(item.ctime.replace(' ', 'T') + '+08:00').toUTCString(),
        link: item.announce_link || (item.id === undefined || item.id === null ? undefined : `https://link.bilibili.com/p/eden/news#/newsdetail?id=${item.id}`),
        sourceId: item.id?.toString(),
    }));

    return {
        title: `bilibili ${productTitle}公告`,
        link,
        description: `bilibili ${productTitle}公告`,
        item: items && distinguishDuplicateGuids(items, 'bilibili-link-news-', link),
    };
}
