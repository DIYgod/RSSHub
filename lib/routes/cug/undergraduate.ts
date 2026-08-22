import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/undergraduate',
    categories: ['university'],
    example: '/cug/undergraduate',
    name: '中国地质大学通知公告',
    maintainers: ['chunibyo-wly'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.cug.edu.cn/index/tzgg.htm';
    const response = await ofetch(baseUrl);
    const $ = load(response);
    const list = $('.xb-list li.xblist-oli');

    const out = await Promise.all(
        list.toArray().map((element) => {
            const $element = $(element);
            const link = new URL($element.find('.xblist-title a').attr('href')!, baseUrl).href;
            const item: DataItem = {
                title: $element.find('.xblist-title h2').text(),
                link,
                pubDate: timezone(parseDate(`${$element.find('.xblist-date p').text()}-${$element.find('.xblist-date h2').text()}`, 'YYYY-MM-DD'), 8),
            };
            if (!new URL(link).hostname.endsWith('www.cug.edu.cn')) {
                return item;
            }
            return cache.tryGet(link, async () => {
                const result = await ofetch(link);
                const $ = load(result);
                item.description = $('.v_news_content').html();
                return item;
            });
        })
    );

    return {
        title: '中国地质大学(武汉) - 综合通知公告',
        link: baseUrl,
        item: out,
    };
}
