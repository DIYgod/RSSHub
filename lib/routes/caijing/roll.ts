import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/roll',
    categories: ['finance'],
    example: '/caijing/roll',
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
            source: ['roll.caijing.com.cn/index1.html', 'roll.caijing.com.cn/'],
        },
    ],
    name: '滚动新闻',
    maintainers: ['TonyRL'],
    handler,
    url: 'roll.caijing.com.cn/index1.html',
};

async function handler() {
    const baseUrl = 'http://roll.caijing.com.cn';
    const response = await got(`${baseUrl}/json/lists1.json`, {
        searchParams: {
            time: Math.random(),
        },
    });

    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url.replace('http://', 'https://'),
        category: item.cat,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const publishedTime = $('#pubtime_baidu').text();
                item.pubDate = publishedTime ? timezone(parseDate(publishedTime, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined;
                item.author = $('.editor').text().trim() || $('#editor_baidu').text().trim().replaceAll(/[()]/g, '');
                item.description = $('.article-content').html();
                item.category = [
                    item.category,
                    ...$('.news_keywords span')
                        .toArray()
                        .map((e) => $(e).text()),
                ];
                return item;
            })
        )
    );

    return {
        title: '滚动新闻-财经网',
        image: 'https://www.caijing.com.cn/favicon.ico',
        link: `${baseUrl}/index1.html`,
        item: items,
    };
}
