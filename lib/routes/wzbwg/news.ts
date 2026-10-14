import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

function parseSourceDate(raw: string) {
    const value = raw.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return;
    }
    const date = timezone(parseDate(value, 'YYYY-MM-DD', true), 8);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
export const route: Route = {
    path: '/news/:type',
    categories: ['travel'],
    example: '/wzbwg/news/24',
    parameters: {
        type: 'News Type, supported values: 24（重要资讯）, 23（通知公告）, 25（工作动态）',
    },
    radar: [
        {
            source: ['www.wzbwg.com/news/:type'],
            target: '/news/:type',
        },
    ],
    name: '资讯',
    maintainers: ['magazian'],
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const baseUrl = 'https://www.wzbwg.com';
        const listUrl = `${baseUrl}/news/${type}`;
        const museumName = namespace.zh?.name || namespace.name;
        const response = await ofetch(listUrl);
        const $ = load(response);
        // use first() to avoid matching the repeat link
        const categoryName = $(`a[href="/news/${type}"]`).first().text();
        const list = $('div.slide.wow.fadeInUp a[href^="/newsinfo/"]')
            .toArray()
            .map((item): DataItem => {
                const a = $(item);
                const title = a.attr('title') ?? '';
                const link = new URL(a.attr('href')!, baseUrl).href;
                const dateRaw =
                    a
                        .find('.c3')
                        .text()
                        .match(/\[(.+?)\]/)?.[1] || '';
                return {
                    title,
                    link,
                    pubDate: parseSourceDate(dateRaw),
                };
            });
        const items = await pMap(
            list,
            async (item) => {
                if (!item.link) {
                    return item;
                }
                const link = item.link;
                const detail = await cache.tryGet(link, async () => {
                    const article = await ofetch(link);
                    const $detail = load(article);
                    const clock =
                        $detail('.info .n2')
                            .text()
                            .match(/\[\s*(\d{4}-\d{2}-\d{2})\s*\]/)?.[1] || '';
                    const pubDate = parseSourceDate(clock);
                    return {
                        description: $detail('.info .txt').html() || undefined,
                        ...(pubDate && { pubDate }),
                    } satisfies Pick<DataItem, 'description' | 'pubDate'>;
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );
        return {
            title: `${museumName} - ${categoryName}`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
