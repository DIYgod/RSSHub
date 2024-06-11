import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const currentURL = 'https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/wikinews/latest',
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
            source: ['zh.wikinews.org/wiki/Special:新闻订阅'],
        },
    ],
    name: '最新新闻',
    maintainers: ['KotoriK'],
    handler,
    description: `根据维基新闻的[sitemap](https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85)获取新闻全文。目前仅支持中文维基新闻。`,
};

async function handler() {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const urls = $('url')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(String.raw`news\:title`).text(),
                pubDate: parseDate(item.find(String.raw`news\:publication_date`).text()),
                category: item
                    .find(String.raw`news\:keywords`)
                    .text()
                    .split(',')
                    .map((item) => item.trim()),
                link: item.find('loc').text(),
            };
        });

    const items = await Promise.all(
        urls.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $ = load(resp.data);
                item.description = $('#bodyContent').html();

                return item;
            })
        )
    );

    return {
        title: '最新新闻 - 维基新闻',
        link: currentURL,
        item: items,
    };
}
