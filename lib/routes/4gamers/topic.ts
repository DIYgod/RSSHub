import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseList, parseItem } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['game'],
    example: '/4gamers/topic/gentlemen-topic',
    parameters: { topic: '主题，可在首页上方页面内找到' },
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
            source: ['www.4gamers.com.tw/news/option-cfg/:topic'],
        },
    ],
    name: '主題',
    maintainers: ['bestpika'],
    handler,
    url: 'www.4gamers.com.tw/news',
};

async function handler(ctx) {
    const topic = ctx.req.param('topic');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const { data: response } = await got(`https://www.4gamers.com.tw/site/api/news/option-cfg/${topic}`, {
        searchParams: {
            pageSize: limit,
        },
    });
    const list = parseList(response.data.results);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    return {
        title: `4Gamers - ${topic}`,
        link: `https://www.4gamers.com.tw/news/option-cfg/${topic}`,
        item: items,
    };
}
