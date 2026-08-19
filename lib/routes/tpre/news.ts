import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['other'],
    example: '/tpre/news',
    radar: [
        {
            source: ['www.tpre.cn/news/zxdt.html'],
        },
    ],
    name: '中心动态',
    maintainers: ['kt286'],
    handler,
    url: 'www.tpre.cn/news/zxdt.html',
};

async function handler() {
    const baseUrl = 'https://www.tpre.cn';
    const link = `${baseUrl}/news/zxdt.html`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.newsLi')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.newsTitle');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.newsTime').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);

                const content = $('.newsinfo .newsDesc');
                const [time, author] = $('.newsinfo .newsTime span')
                    .toArray()
                    .map((e) => $(e).text());

                return {
                    ...item,
                    description: content.html(),
                    pubDate: timezone(parseDate(time.replace('时间：', ''), 'YYYY-M-D H:mm:ss'), 8),
                    author: author?.replace('作者：', ''),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
