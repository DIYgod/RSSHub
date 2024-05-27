import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';
// import { load } from 'cheerio';

export const route: Route = {
    path: '/newsflash',
    categories: ['new-media'],
    example: '/leiphone/newsflash',
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
            source: ['leiphone.com/'],
        },
    ],
    name: '业界资讯',
    maintainers: [],
    handler,
    url: 'leiphone.com/',
};

async function handler() {
    const url = 'https://www.leiphone.com/site/YejieKuaixun';
    const res = await got.get(url);
    const article = (res.data || {}).article || [];

    const list = article.map((item) => item.url);
    const items = await utils.ProcessFeed(list, cache);

    return {
        title: '雷峰网 业界资讯',
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    };
}
