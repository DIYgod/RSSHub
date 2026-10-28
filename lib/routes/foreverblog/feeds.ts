import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/feeds',
    categories: ['blog'],
    example: '/foreverblog/feeds',
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
            source: ['www.foreverblog.cn/feeds.html'],
        },
    ],
    name: '专题展示 - 文章',
    maintainers: ['7Wate', 'a180285'],
    handler,
    url: 'www.foreverblog.cn/feeds.html',
};

async function handler() {
    const currentUrl = 'https://www.foreverblog.cn/feeds.html';

    const response = await got(currentUrl);

    const $ = load(response.data);
    const items = $('article.feed-row')
        .toArray()
        .map((el) => {
            const $item = $(el);
            const $title = $item.find('.feed-row__article > a');
            const date = $item.find('time').text();
            return {
                title: $title.text(),
                link: $title.attr('href'),
                author: $item.find('.feed-row__blog > a').text(),
                pubDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseDate(`${date}T00:00:00Z`) : undefined,
                category: $item.attr('data-category'),
            };
        });

    return {
        title: '十年之约——专题展示',
        link: currentUrl,
        item: items,
    };
}
