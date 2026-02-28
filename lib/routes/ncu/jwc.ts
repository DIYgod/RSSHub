import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got'; // 自订的 got
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/ncu/jwc',
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
            source: ['jwc.ncu.edu.cn/', 'jwc.ncu.edu.cn/Notices.jsp'],
        },
    ],
    name: '教务通知',
    maintainers: ['ywh555hhh', 'jixiuweilan'],
    handler,
    url: 'jwc.ncu.edu.cn/',
};

async function handler() {
    const baseUrl = 'https://jwc.ncu.edu.cn';
    const targetUrl = `${baseUrl}/Notices.jsp?urltype=tree.TreeTempUrl&wbtreeid=1541`;

    const response = await got(targetUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = load(response.body);

    const list = $('div.space-y-2 div.group');

    const items = list
        .toArray()
        .map((item) => {
            const el = $(item);
            const linkEl = el.find('a').first();

            const title = linkEl.find('span.text-gray-700').text().trim() || linkEl.text().trim();
            const rawLink = linkEl.attr('href');
            const link = rawLink ? new URL(rawLink, baseUrl).href : '';

            const dateText = el
                .find('.font-mono span')
                .filter((_, e) => {
                    const cls = $(e).attr('class') || '';
                    return cls.includes('md:inline') || cls.includes(String.raw`md\:inline`);
                })
                .text()
                .trim();

            return {
                title,
                link,
                pubDate: parseDate(dateText, 'YYYY-MM-DD'),
            };
        })
        .filter((item) => item.title && item.link);

    return {
        title: '南昌大学教务处 - 通知公告',
        link: targetUrl,
        description: '南昌大学教务处通知公告',
        item: items,
    };
}
