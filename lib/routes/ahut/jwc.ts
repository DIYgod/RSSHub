import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/ahut/jwc',
    name: '教务处',
    maintainers: ['Diffumist'],
    handler,
};

async function handler() {
    const link = 'https://jwc.ahut.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1082';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.winstyle16974 a.c16974')
        .toArray()
        .map((item) => {
            const a = $(item);
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href')!, 'https://jwc.ahut.edu.cn/').href,
                pubDate: timezone(parseDate(a.closest('tr').find('.timestyle16974').text().trim(), 'YYYY/MM/DD'), 8),
            };
        }) as DataItem[];

    const out = await Promise.all(
        list.map((item) => {
            if (!new URL(item.link!).hostname.endsWith('.ahut.edu.cn')) {
                return item;
            }
            return cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const $ = load(detailResponse);

                return {
                    ...item,
                    description: $('.v_news_content').html(),
                };
            });
        })
    );

    return {
        title: '安徽工业大学 - 教务处',
        link,
        description: '安徽工业大学 - 教务处',
        item: out,
    };
}
