import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://rustcc.cn';

export const route: Route = {
    path: '/jobs',
    categories: ['programming'],
    example: '/rustcc/jobs',
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
            source: ['rustcc.cn/'],
        },
    ],
    name: '招聘',
    maintainers: ['CcccFz'],
    handler,
    url: 'rustcc.cn/',
};

async function handler() {
    const jobsUrl = 'https://rustcc.cn/section?id=fed6b7de-0a74-48eb-8988-1978858c9b35';

    const response = await got({
        url: jobsUrl,
    });

    const $ = load(response.data);
    const list: Array<DataItem & { link: string }> = $('.article-list li')
        .toArray()
        .flatMap((el) => {
            const item = $(el);
            const title = item.find('.title');
            if (!title.text()) {
                return [];
            }
            const href = title.attr('href');
            if (!href) {
                throw new Error('RustCC article URL is missing');
            }
            return {
                title: title.text(),
                author: item.find('.info .author').text().trim() || undefined,
                category: item
                    .find('.info .tags')
                    .text()
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                link: new URL(href, baseUrl).href,
                pubDate: timezone(parseDate(item.find('.info .timestamp').text(), 'YYYY-MM-DD HH:mm'), 8),
            };
        });
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.body);
                const body = $('.detail-body');
                if (!body.length) {
                    throw new Error('RustCC article body is missing');
                }
                return body.html();
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'Rust语言中文社区 | 招聘',
        link: jobsUrl,
        description: '获取Rust语言中文社区的最新招聘',
        item: items,
    };
}
