import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

const link = 'https://news.sina.com.cn/world/';

export const route: Route = {
    path: '/world',
    categories: ['new-media'],
    example: '/sina/world',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国际新闻',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['news.sina.com.cn/world/'],
            target: '/sina/world',
        },
    ],
    handler,
};

async function handler() {
    const response = await ofetch(link, {
        headers: {
            referer: 'https://news.sina.com.cn/',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
        },
    });
    const $ = load(response);

    const items = $('#subShowContent1_static .news-item h2 a[href]')
        .toArray()
        .flatMap((element) => {
            const anchor = $(element);
            const href = anchor.attr('href');
            const title = anchor.text().trim();

            if (!href || !title) {
                return [];
            }

            const item = anchor.closest('.news-item');
            const itemLink = new URL(href, link).href;
            const timeText = item.find('.time').first().text().trim();

            return [
                {
                    title,
                    link: itemLink,
                    guid: itemLink,
                    pubDate: parseSinaDate(itemLink, timeText),
                    description: timeText,
                },
            ];
        });

    return {
        title: '新浪国际新闻',
        link,
        item: items,
    };
}

function parseSinaDate(itemLink: string, timeText: string) {
    const dateMatch = /\/(\d{4})-(\d{2})-(\d{2})\//.exec(itemLink);
    const timeMatch = /(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/.exec(timeText);

    if (dateMatch && timeMatch) {
        const [, year] = dateMatch;
        const [, month, day, hour, minute] = timeMatch;
        return new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${minute}:00+08:00`);
    }

    if (dateMatch) {
        const [, year, month, day] = dateMatch;
        return new Date(`${year}-${month}-${day}T00:00:00+08:00`);
    }
}

function pad(value: string) {
    return value.padStart(2, '0');
}
