import type { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const url = 'https://english.news.cn/list/latestnews.htm';
const baseUrl = 'https://english.news.cn';

export const route: Route = {
    path: '/latest',
    name: 'Latest News',
    maintainers: ['JudeThu'],
    example: '/xinhua/latest',
    categories: ['traditional-media'],
    url,
    handler: async () => {
        const response = await got(url, {
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'en-US,en;q=0.9',
                referer: 'https://english.news.cn/',
            },
        });

        const $ = cheerio.load(response.data);

        const list = $('#list .item').get();

        if (list.length === 0) {
            throw new Error('Could not find any latest news items. Selector might be outdated.');
        }

        const items = list
            .map((item) => {
                const el = $(item);
                const a = el.find('.tit a');
                const href = a.attr('href');
                const title = a.text().trim();
                const dateStr = el.find('.time').text().trim();

                if (!title || !href) {
                    return null;
                }

                return {
                    title,
                    link: new URL(href, baseUrl).toString(),
                    pubDate: dateStr ? parseDate(dateStr) : undefined,
                    description: title,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        return {
            title: 'Xinhua News - Latest',
            link: url,
            item: items,
        };
    },
};