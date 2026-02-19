import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const $articles = $('article[class="post post-type-normal"]');
    const items = $articles.toArray().map((el) => {
        const $titleDiv = $(el).find('h1[class="post-title"]');
        const title = $titleDiv.text().trim();
        const link = $titleDiv.find('a').eq(0).attr('href');
        const author = $(el).find('div[class="post-author"]').text().trim();
        const postDate = $(el).find('time').text().trim();
        const pubDate = timezone(parseDate(postDate, 'MM-DD'), +8);
        const description = `${author}: ${title}`;
        return {
            title: description,
            description,
            link,
            pubDate,
        };
    });

    return {
        title: '十年之约——专题展示',
        link: currentUrl,
        item: items,
    };
}
