import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/graduate',
    categories: ['university'],
    example: '/cug/graduate',
    radar: [
        {
            source: ['graduate.cug.edu.cn/tzgg.htm'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['sanmmm'],
    handler,
    url: 'graduate.cug.edu.cn/tzgg.htm',
};

async function handler() {
    const baseUrl = 'https://graduate.cug.edu.cn';
    const link = `${baseUrl}/tzgg.htm`;
    const res = await ofetch(link);
    const $ = load(res);
    const list: DataItem[] = $('.btlist ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.attr('title') || a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.time').text(), 'YYYY-MM-DD'), 8),
            };
        });
    const item = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!);
                const $ = load(res);
                item.description = $('.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: '中国地质大学(武汉)研究生院 - 通知公告',
        link,
        item,
    };
}
