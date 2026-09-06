import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/tz',
    categories: ['university'],
    example: '/cqu/news/tz',
    name: '新闻网通知公告简报',
    maintainers: ['Hagb'],
    handler,
};

async function handler() {
    const baseUrl = 'https://news.cqu.edu.cn/';
    const url = 'https://news.cqu.edu.cn/archives/notice/index.html';
    const response = await ofetch(url);
    const $ = load(response);

    const links = $('div[class=lists]', 'div[class="container newslist"]')
        .find('div[class="content w100"]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a[href]');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('div[class=rdate]').attr('date')!), 8),
            };
        });

    const items = await Promise.all(
        links.map(({ title, link, pubDate }) =>
            cache.tryGet(link, async () => {
                const detailResponse = await ofetch(link);
                const $detail = load(detailResponse);
                const newsContent = $detail('div[class=content]', 'div[class="container detail"]');

                const authorStrings = newsContent
                    .find('p')
                    .find('a[href="javascript:;"]')
                    .toArray()
                    .map((item) => $detail(item).text())
                    .filter(Boolean);

                return {
                    title,
                    link,
                    pubDate,
                    author: authorStrings.join('-'),
                    description: newsContent.find('div[class=acontent]').html(),
                };
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
