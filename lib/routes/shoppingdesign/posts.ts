import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import asyncPool from 'tiny-async-pool';

export const route: Route = {
    path: '/posts',
    categories: ['design'],
    example: '/shoppingdesign/posts',
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
            source: ['www.shoppingdesign.com.tw/post'],
        },
    ],
    name: '文章列表',
    maintainers: ['miles170'],
    handler,
    url: 'www.shoppingdesign.com.tw/post',
};

async function handler() {
    // sn_f parameter is required to prevent redirection
    const currentUrl = 'https://www.shoppingdesign.com.tw/post?sn_f=1';
    const response = await got(currentUrl);
    const $ = load(response.data);
    const items = [];
    // maximum parallel requests on the target website are limited to 11.
    for await (const data of asyncPool(10, $('article-item'), (item) => {
        item = $(item);
        const link = item.attr('url');
        return cache.tryGet(link, async () => {
            const response = await got(`${link}?sn_f=1`);
            const $ = load(response.data);
            const article = $('.left article .htmlview');
            article.find('d-image').each(function () {
                $(this).replaceWith(`<img src="${$(this).attr('lg')}">`);
            });

            return {
                title: $('.left article .top_info h1').text(),
                author: $('meta[name="my:author"]').attr('content'),
                description: article.html(),
                category: $('meta[name="my:category"]').attr('content'),
                pubDate: parseDate($('meta[name="my:publish"]').attr('content')),
                link,
            };
        });
    })) {
        items.push(data);
    }

    return {
        title: $('meta[property="og:title"]').attr('content'),
        link: currentUrl,
        description: $('meta[property="og:description"]').attr('content'),
        item: items,
    };
}
