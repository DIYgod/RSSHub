import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

function parsePubDate(value?: string, format = 'YYYY-MM-DD') {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(`${value} +08:00`, `${format} Z`);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler() {
    const baseUrl = 'https://www.tpre.cn';
    const link = `${baseUrl}/news/zxdt.html`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.newsLi')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a.newsTitle');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parsePubDate($item.find('.newsTime').text()),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`tpre:news:detail:v2:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const $ = load(detailResponse);

                const content = $('.newsinfo .newsDesc');
                const [time, author] = $('.newsinfo .newsTime span')
                    .toArray()
                    .map((e) => $(e).text());

                return {
                    description: content.html(),
                    pubDate: parsePubDate(time?.replace('时间：', ''), 'YYYY-M-D H:mm:ss'),
                    author: author?.replace('作者：', ''),
                };
            });
            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
