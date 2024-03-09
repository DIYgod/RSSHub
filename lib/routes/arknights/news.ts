import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/arknights/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['ak-conf.hypergryph.com/*'],
    },
    name: '游戏公告与新闻',
    maintainers: ['Astrian'],
    handler,
    url: 'ak-conf.hypergryph.com/*',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://ak.hypergryph.com/news.html',
    });

    let newslist = response.data;

    const $ = load(newslist);
    newslist = $('.articleItem > .articleItemLink');

    newslist = await Promise.all(
        newslist
            .slice(0, 9) // limit article count to a single page
            .map(async (index, item) => {
                item = $(item);
                const link = `https://ak.hypergryph.com${item.attr('href')}`;
                const description = await cache.tryGet(link, async () => {
                    const result = await got(link);
                    const $ = load(result.data);
                    return $('.article-content').html();
                });
                return {
                    title: `[${item.find('.articleItemCate').first().text()}] ${item.find('.articleItemTitle').first().text()}`,
                    description,
                    link,
                    pubDate: parseDate(item.find('.articleItemDate').first().text()),
                };
            })
            .get()
    );

    return {
        title: '《明日方舟》游戏公告与新闻',
        link: 'https://ak.hypergryph.com/news.html',
        item: newslist,
    };
}
