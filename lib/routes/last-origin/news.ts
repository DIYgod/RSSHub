import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'www.last-origin.com',
    maintainers: ['gudezhi'],
    example: '/last-origin/news',
    parameters: {},
    categories: ['game'],
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.last-origin.com/news.html', 'www.last-origin.com'],
            target: '/news',
        },
    ],
    handler,
    description: '',
};

async function handler() {
    const baseUrl = 'https://www.last-origin.com/news.html';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const list = $('.contents .news_wrap')
        .toArray()
        .map((item) => {
            const title = $(item).find('.news_title').text().trim();
            const link = new URL($(item).find('a').attr('href')!, baseUrl).href;
            const date = $(item).find('time').text().trim();
            const pubDate = timezone(parseDate(date), +9);
            return {
                title,
                link,
                pubDate,
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.news_contents_editor').html() ?? '';
                return item;
            })
        )
    );

    return {
        title: 'LastOrigin官网公告',
        link: baseUrl,
        item: items,
    };
}
