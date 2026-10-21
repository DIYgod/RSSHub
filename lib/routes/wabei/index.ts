import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hot-recommend',
    categories: ['finance'],
    example: '/wabei/hot-recommend',
    url: 'www.wabei.cn',
    name: '热门推荐',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.wabei.cn';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = load(response.data);

    const list = $('.hot-news.visible-lg')
        .toArray()
        .map((item): DataItem => {
            const elem = $(item);
            const title = elem.find('h4 a').text();
            const link = elem.find('h4 a').attr('href');
            const author = elem.find('span.author').text().trim();
            const description = elem.find('p.visible-lg a').text().trim();

            const label = elem.find('span.lable').text().trim();
            const tags = elem
                .find('span.blue-btn')
                .toArray()
                .map((tag) => $(tag).text().trim());
            const category = [label, ...tags];

            return {
                title,
                link: `${baseUrl}${link}`,
                category,
                author,
                description,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate'>>(`wabei:detail:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                const published = content('.attr .time').text().trim();
                const pubDate = published ? timezone(parseDate(published, 'YYYY/M/D H:mm:ss'), 8) : undefined;
                return {
                    description: content('.subject-content').html() || undefined,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                };
            });
            return { ...item, ...details, description: details.description || item.description };
        },
        { concurrency: 3 }
    );

    return {
        title: '挖贝网 - 热门推荐',
        link: baseUrl,
        item: items,
    };
}
