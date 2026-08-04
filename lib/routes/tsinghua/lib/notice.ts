import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lib/notice',
    categories: ['university'],
    example: '/tsinghua/lib/notice',
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
            source: ['lib.tsinghua.edu.cn/tzgg.htm'],
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['Aquarius-Situla'],
    handler: async () => {
        const baseUrl = 'https://lib.tsinghua.edu.cn';
        const link = `${baseUrl}/tzgg.htm`;

        const response = await ofetch(link);
        const $ = load(response);

        // Extract list page items
        let items: DataItem[] = $('ul.notice-list li')
            .toArray()
            .filter((item) => $(item).find('.notice-list-tt a').attr('href'))
            .map((item) => {
                const $item = $(item);
                const a = $item.find('.notice-list-tt a');
                const title = a.text().trim();
                const href = a.attr('href') as string;
                const dateStr = $item.find('.notice-date').text().trim();
                const category = $item.find('.notice-label').text().trim();

                return {
                    title,
                    link: new URL(href, link).href,
                    pubDate: parseDate(dateStr, 'YYYY-MM-DD'),
                    category,
                };
            });

        // Fetch article body with cache
        items = (await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link as string, async () => {
                    const itemResponse = await ofetch(item.link as string);
                    const $$ = load(itemResponse);
                    item.description = $$('.v_news_content').html() || undefined;
                    return item as DataItem;
                })
            )
        )) as DataItem[];

        return {
            title: '清华大学图书馆 - 通知公告',
            link,
            description: '清华大学图书馆 - 通知公告',
            item: items,
        };
    },
};
