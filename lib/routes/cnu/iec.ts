import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/iec',
    categories: ['university'],
    example: '/cnu/iec',
    parameters: {},
    radar: [
        {
            source: ['iec.cnu.edu.cn/ggml/tzgg1/index.htm'],
            target: '/cnu/iec',
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

            // 提取日期 [YYYY-MM-DD]
            const dateText = span.text().trim();
            const dateMatch = dateText.match(/\[(\d{4}-\d{2}-\d{2})\]/);
            const pubDate = dateMatch ? parseDate(dateMatch[1], 'YYYY-MM-DD') : undefined;

            // 提取标题
            const title = a.text().trim();

            // 提取链接
            const href = a.attr('href');
            const linkUrl = href?.startsWith('http') ? href : `${baseUrl}/ggml/tzgg1/${href}`;

            return {
                title,
                link: linkUrl,
                pubDate,
                description: '',
            };
        })
        .filter((item) => item.title && item.link); // 过滤掉无效项

    return {
        title: '首都师范大学信息工程学院 - 通知公告',
        link,
        description: '首都师范大学信息工程学院通知公告',
        item: list,
    };
}
