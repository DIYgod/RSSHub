import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjsy',
    categories: ['university'],
    example: '/cpu/yjsy',
    name: '研究生院',
    maintainers: ['kba977'],
    handler,
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://yjsy.cpu.edu.cn';
    const url = `${baseUrl}/6335/list.htm`;
    const response = await ofetch(url);
    const $ = load(response);

    const list: DataItem[] = $('ul.news_list li.news')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.news_title a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await ofetch(item.link!);
                const $ = load(detail);

                item.description = $('.wp_articlecontent').html();

                return item;
            })
        )
    );

    return {
        title: '中国药科大学 - 研究生院 | 最新通知',
        link: url,
        item: resultItem,
        description: '中国药科大学 | 研究生院',
    };
}
