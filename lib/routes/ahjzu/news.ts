import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/ahjzu/news',
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
            source: ['www.ahjzu.edu.cn/20/list.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['Yuk-0v0'],
    handler,
    url: 'www.ahjzu.edu.cn/20/list.htm',
};

async function handler() {
    const rootUrl = 'https://www.ahjzu.edu.cn';
    const currentUrl = 'https://www.ahjzu.edu.cn/20/list.htm';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.news_list li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const date = $item.find('.news_metat').text();
            const a = $item.find('.news_title a');
            return {
                title: a.attr('title') ?? a.text(),
                link: new URL(a.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate(date), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const post = content('.wp_articlecontent').html();

                item.description = post;
                return item;
            })
        )
    );

    return {
        title: '安建大-通知公告',
        description: '安徽建筑大学-通知公告',
        link: currentUrl,
        item: items,
    };
}
