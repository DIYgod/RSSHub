import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jdxw',
    categories: ['university'],
    example: '/cnu/jdxw',
    parameters: {},
    radar: [
        {
            source: ['news.cnu.edu.cn/xysx/jdxw/index.htm'],
            target: '/cnu/jdxw',
        },
    ],
    name: '焦点关注',
    maintainers: ['liueic'],
    handler,
    url: 'news.cnu.edu.cn/xysx/jdxw/index.htm',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler() {
    const baseUrl = 'https://news.cnu.edu.cn';
    const link = `${baseUrl}/xysx/jdxw/index.htm`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('ul.list3 > li')
        .toArray()
        .map((e) => {
            const item = $(e);
            const a = item.find('a');
            const href = a.attr('href');
            const linkUrl = href?.startsWith('http') ? href : `${baseUrl}/xysx/jdxw/${href}`;

            return {
                title: item.find('span.listTitle').text().trim(),
                link: linkUrl,
                pubDate: parseDate(item.find('span.listDate').text().trim(), 'YYYY-MM-DD'),
                description: '',
            };
        });

    return {
        title: '首都师范大学新闻网 - 焦点关注',
        link,
        description: '首都师范大学新闻网焦点关注栏目最新新闻',
        item: list,
    };
}
