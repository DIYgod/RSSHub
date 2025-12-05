import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/novel/:id',
    categories: ['reading'],
    example: '/linovelib/novel/2547',
    parameters: { id: '小说 id，对应书架开始阅读 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '小说更新',
    maintainers: ['misakicoca'],
    handler,
};

async function handler(ctx) {
    const response = await got(`https://www.linovelib.com/novel/${ctx.req.param('id')}/catalog`);
    const $ = load(response.data);

    const meta = $('.book-meta');
    const title = meta.children().first().text();
    const author = meta.find('p > span > a').text();

    const list = $('.chapter-list');
    const items = list
        .find('li')
        .find('a')
        .toArray()
        .filter((item) => $(item).attr('href').startsWith('/novel/'))
        .map((item) => ({
            title: $(item).text(),
            author,
            description: $(item).text(),
            link: `https://www.linovelib.com${$(item).attr('href')}`,
        }));
    items.reverse();

    return {
        title: `哩哔轻小说 - ${title}`,
        link: `https://www.linovelib.com/novel/${ctx.req.param('id')}/catalog`,
        description: title,
        language: 'zh',
        item: items,
    };
}
