import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/article',
    categories: ['design'],
    example: '/ui.cn/article',
    name: '推荐文章',
    maintainers: ['WenryXu'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.ui.cn';

    const response = await ofetch(`${baseUrl}/`);
    const $ = load(response);

    const list = $('#article .h-article-list li')
        .toArray()
        .map((item) => {
            const a = $(item).find('.ellipsis');
            const link = new URL(a.attr('href')!, `${baseUrl}/`).href;
            return {
                title: a.text(),
                link,
                guid: link,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detailData = await cache.tryGet(`ui.cn:article:detail:v2:${item.link}`, async () => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);
                const date = $detail('.works-top .time em').text().replaceAll('更新于：', '');
                const pubDate = date ? parseDate(date) : undefined;

                return {
                    description: $detail('.exp-content').html(),
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? timezone(pubDate, 8) : undefined,
                };
            });
            return { ...item, ...detailData };
        },
        { concurrency: 3 }
    );

    return {
        title: '推荐文章 - UI 中国',
        link: `${baseUrl}/`,
        item: items,
    };
}
