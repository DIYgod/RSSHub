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
    const baseUrl = 'https://roll.caijing.com.cn';
    const response = await got(`${baseUrl}/ajax_lists.php`, {
        searchParams: {
            modelid: 0,
            time: Math.random(),
        },
    });

    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url.replace('http://', 'https://'),
        pubDate: timezone(parseDate(item.published, 'MM-DD HH:mm'), +8),
        category: item.cat,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
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
        link: response.url,
        item: items,
    };
}
