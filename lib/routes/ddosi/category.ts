import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category?',
    categories: ['blog'],
    example: '/ddosi/category/黑客工具',
    parameters: { category: 'N' },
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
            source: ['ddosi.org/category/:category/'],
            target: '/category/:category',
        },
    ],
    name: '分类',
    maintainers: ['XinRoom'],
    handler,
    url: 'ddosi.org/',
};

async function handler(ctx) {
    const url = 'https://www.ddosi.org/category';
    const category = ctx.req.param('category');
    const response = await got({
        method: 'get',
        url: `${url}/${category}/`,
        headers: {
            Referer: url,
        },
        headerGeneratorOptions: PRESETS.MODERN_IOS,
    });
    const $ = load(response.data);
    const list = $('main>article').toArray();

    const items = list.map((i) => {
        const item = $(i);

        const href = item.find('a:first-child').attr('href');
        const title = item.find('.entry-title a').text();
        const description = item.find('.entry-content p').text();
        const date = parseDate(item.find('.meta-date a time').attr('datetime'));

        return {
            title: String(title),
            description: String(description),
            pubDate: date,
            link: String(href),
        };
    });

    return {
        title: `雨苁-${category}`,
        link: `${url}/${category}/`,
        item: items,
    };
}
