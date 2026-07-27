import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['guanhai.com.cn/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'guanhai.com.cn/',
};

async function handler() {
    const { data: response } = await got('https://www.guanhai.com.cn');
    const $ = load(response);

    const recommand = $('.img-box ul > a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.attr('title')!,
                link: $item.attr('href'),
                author: undefined as DataItem['author'],
                description: undefined as DataItem['description'],
                pubDate: undefined as DataItem['pubDate'],
            };
        });

    const list = [
        ...$('.pic-summary .title')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').attr('title')!,
                    link: $item.find('a').attr('href'),
                    pubDate: timezone(parseDate($item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                    author: undefined as any,
                    description: undefined as any,
                };
            }),
        ...recommand,
    ].filter((item) => item.link!.startsWith('http'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.author = $('.source').text();
                item.description = $('.article-content').html() ?? $('.video-content').html();
                item.pubDate ??= timezone(parseDate($('.date').text(), 'YYYY-MM-DD HH:mm'), 8);
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name=description]').text(),
        image: 'https://www.guanhai.com.cn/favicon.ico',
        link: 'https://www.guanhai.com.cn',
        item: items,
    };
}
