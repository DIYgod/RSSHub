import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/career',
    categories: ['university'],
    example: '/ccnu/career',
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
            source: ['ccnu.91wllm.com/news/index/tag/tzgg', 'ccnu.91wllm.com/'],
        },
    ],
    name: '就业信息',
    maintainers: ['jackyu1996'],
    handler,
    url: 'ccnu.91wllm.com/news/index/tag/tzgg',
};

async function handler() {
    const host = 'https://ccnu.91wllm.com';
    const link = `${host}/news/index/tag/tzgg`;

    const response = await got(link);

    const $ = load(response.data);
    const list = $('.newsList');

    const items =
        list &&
        list.toArray().map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                pubDate: parseDate(item.find('.y').text(), 'YYYY-MM-DD'),
                link: `${host}${a.attr('href')}`,
            };
        });

    return {
        title: '华中师范大学就业信息',
        link,
        item: items,
    };
}
