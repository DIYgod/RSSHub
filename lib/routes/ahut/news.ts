import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/ahut/news',
    radar: [
        {
            source: ['news.ahut.edu.cn/xyyw.htm'],
        },
    ],
    name: '学校要闻',
    maintainers: ['Diffumist'],
    handler,
    url: 'news.ahut.edu.cn/xyyw.htm',
};

async function handler() {
    const link = 'https://news.ahut.edu.cn/xyyw.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.p2_left_ul li a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.attr('title'),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('.sj .p2').text(), 'YYYY-MM-DD'), 8),
            };
        }) as DataItem[];

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const $ = load(detailResponse);

                return {
                    ...item,
                    description: $('.v_news_content').html(),
                };
            })
        )
    );

    return {
        title: '安徽工业大学 - 学校要闻',
        link,
        description: '安徽工业大学 - 学校要闻',
        item: out,
    };
}
