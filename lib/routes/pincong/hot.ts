import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, get } from './utils';

export const route: Route = {
    path: '/hot/:category?',
    categories: ['bbs'],
    example: '/pincong/hot',
    parameters: { category: '分类，与官网分类 URL `category-` 后的数字对应，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精选',
    maintainers: ['zphw'],
    handler,
};

async function handler(ctx) {
    const { category = '0' } = ctx.req.param();

    const url = `${baseUrl}/hot/list/category-${category}`;

    const html = await get(url, cache);

    const $ = load(html);
    const list = $('div.aw-item');

    return {
        title: '品葱 - 精选',
        link: `${baseUrl}/hot/${category === '0' ? '' : `category-${category}`}`,
        item: list
            .toArray()
            .map((item) => ({
                title: $(item).find('h2 a').text(),
                description: $(item).find('div.markitup-box').html(),
                link: baseUrl + $(item).find('div.mod-head h2 a').attr('href'),
                // The footer can carry the discussion count after the date, such as `2026-06-07 22 条讨论`
                pubDate: parseDate($(item).find('div.mod-footer .aw-small-text').text(), 'YYYY-MM-DD'),
            }))
            // The list can show the same question twice
            .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index),
    };
}
