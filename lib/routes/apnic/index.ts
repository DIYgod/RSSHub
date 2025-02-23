import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/apnic/blog',
    url: 'blog.apnic.net',
    name: 'Blog',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://blog.apnic.net';
    const feedUrl = `${baseUrl}/feed/`;

    const response = await got(feedUrl);
    const $ = load(response.data, { xmlMode: true });

    // 从 RSS XML 中直接提取文章信息
    const list = $('item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('title').text(),
                link: $item.find('link').text(),
                author: $item.find(String.raw`dc\:creator`).text(),
                category:
                    $item
                        .find('category')
                        .text()
                        .match(/>([^<]+)</)?.[1] || '',
                pubDate: parseDate($item.find('pubDate').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: articleData } = await got(item.link);
                const $article = load(articleData);

                // 获取文章正文内容
                item.description = $article('.entry-content').html();
                return item;
            })
        )
    );

    return {
        title: 'APNIC Blog',
        link: baseUrl,
        item: items,
    };
}
