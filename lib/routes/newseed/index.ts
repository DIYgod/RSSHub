import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/newseed/latest',
    url: 'news.newseed.cn',
    name: '最新新闻',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://news.newseed.cn/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = load(response.data);

    const list = $('#news-list li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const a = element.find('h3 a');
            const link = a.attr('href') || '';
            const title = a.text();
            const image = element.find('.img img').attr('src');
            const info = element.find('.info');
            const author = info.find('.author a').text();
            const pubDate = info.find('.date').text();
            const tags = element
                .find('.tag a')
                .toArray()
                .map((el) => $(el).text())
                .filter((tag) => tag !== author);

            return {
                title,
                link,
                author,
                pubDate,
                category: tags,
                description: image ? `<img src="${image}"><br>${title}` : title,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);
                item.description = $('.news-content').html() || item.description;
                return item;
            })
        )
    );

    return {
        title: '新芽 - 最新新闻',
        link: baseUrl,
        item: items,
    };
}
