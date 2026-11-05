import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/iec',
    categories: ['university'],
    example: '/cnu/iec',
    parameters: {},
    radar: [
        {
            source: ['iec.cnu.edu.cn/ggml/tzgg1/index.htm'],
            target: '/iec',
        },
    ],
    name: '信息工程学院通知公告',
    maintainers: ['liueic'],
    handler,
    url: 'iec.cnu.edu.cn/ggml/tzgg1/index.htm',
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
    const baseUrl = 'https://iec.cnu.edu.cn';
    const link = `${baseUrl}/ggml/tzgg1/index.htm`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('.articleList.articleList2 ul > li')
        .toArray()
        .map((e) => {
            const item = $(e);
            const span = item.find('span');
            const a = item.find('a');

            // Extract the date in [YYYY-MM-DD] format.
            const dateText = span.text();
            const dateMatch = dateText.match(/\[(\d{4}-\d{2}-\d{2})\]/);
            const pubDate = dateMatch ? timezone(parseDate(dateMatch[1], 'YYYY-MM-DD'), 8) : undefined;

            // Extract the title.
            const title = a.text().trim();

            // Extract the link.
            const href = a.attr('href');
            const linkUrl = href?.startsWith('http') ? href : `${baseUrl}/ggml/tzgg1/${href}`;

            return {
                title,
                link: linkUrl,
                pubDate,
                description: '',
            };
        })
        .filter((item) => item.title && item.link); // Exclude entries without a title or link.

    return {
        title: '首都师范大学信息工程学院 - 通知公告',
        link,
        description: '首都师范大学信息工程学院通知公告',
        item: list,
    };
}
