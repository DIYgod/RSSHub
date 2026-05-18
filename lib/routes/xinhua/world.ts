import type { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const url = 'https://english.news.cn/world/index.htm';
const baseUrl = 'https://english.news.cn';

export const route: Route = {
    path: '/world',
    name: 'World News',
    maintainers: ['JudeThu'],
    example: '/xinhua/world',
    categories: ['traditional-media'],
    url,
    handler: async (ctx) => {
        const response = await got(url, {
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'en-US,en;q=0.9',
                referer: 'https://english.news.cn/',
            },
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const debugListCount = $('#list .item').length;
        const debugTitleCount = $('.tit a').length;
        const debugTimeCount = $('.time').length;

        if (debugListCount === 0) {
            throw new Error(
                `Selector failed. #list .item=${debugListCount}, .tit a=${debugTitleCount}, .time=${debugTimeCount}, html_length=${html.length}, html_head=${html.slice(0, 1000)}`
            );
        }

        const items = $('#list .item')
            .get()
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
            title: 'Xinhua News - World',
            link: url,
            item: items,
        };
    },
};