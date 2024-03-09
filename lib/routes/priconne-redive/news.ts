import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/priconne-redive/news',
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
        source: ['priconne-redive.jp/news'],
    },
    name: '日服公告',
    maintainers: ['SayaSS'],
    handler,
    url: 'priconne-redive.jp/news',
};

async function handler() {
    const parseContent = (htmlString) => {
        const $ = load(htmlString);

        $('.contents-body h3').remove();
        const time = $('.meta-info .time').text().trim();
        $('.meta-info').remove();
        const content = $('.contents-body');

        return {
            description: content.html(),
            pubDate: new Date(time),
        };
    };

    const response = await got({
        method: 'get',
        url: 'https://priconne-redive.jp/news/',
    });
    const data = response.data;
    const $ = load(data);
    const list = $('.article_box');

    const out = await Promise.all(
        list.map((index, item) => {
            item = $(item);
            const link = item.find('a').first().attr('href');
            return cache.tryGet(link, async () => {
                const rssitem = {
                    title: item.find('h4').text(),
                    link,
                };

                const response = await got(link);
                const result = parseContent(response.data);

                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;

                return rssitem;
            });
        })
    );

    return {
        title: '公主链接日服-新闻',
        link: 'https://priconne-redive.jp/news/',
        language: 'ja',
        item: out,
    };
}
