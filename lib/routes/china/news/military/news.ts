import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/military',
    categories: ['new-media'],
    example: '/china/news/military',
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
            source: ['military.china.com/news'],
        },
    ],
    name: 'Military - Military News 军事 - 军事新闻',
    maintainers: ['jiaaoMario'],
    handler,
    url: 'military.china.com/news',
};

async function handler() {
    const websiteUrl = 'https://military.china.com/news/';
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = load(data);
    const commonList = $('.item_list li');
    const entries = commonList.toArray().map((item): DataItem => {
        const $item = $(item);
        return {
            title: $item.find('h3.item_title').text(),
            author: $item.find('.item_source').text(),
            category: '中华网军事',
            pubDate: timezone(parseDate($item.find('em.item_time').text()), 8),
            link: $item.find('h3.item_title a').attr('href'),
        };
    });
    const items = await Promise.all(
        entries.map((entry) =>
            cache.tryGet(entry.link!, async () => {
                const { data: detail } = await got(entry.link!);
                const $$ = load(detail);
                const articleDate = $$('#chan_newsInfo .time').text();
                return {
                    ...entry,
                    title: $$('h1').text() || entry.title,
                    description: $$('#chan_newsDetail').html(),
                    pubDate: articleDate ? timezone(parseDate(articleDate), 8) : entry.pubDate,
                    author:
                        $$('#chan_newsInfo .source')
                            .text()
                            .replace(/^来源：\s*/, '') || entry.author,
                };
            })
        )
    );
    return {
        title: '中华网-军事新闻',
        link: websiteUrl,
        item: items,
    };
}
