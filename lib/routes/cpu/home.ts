import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/home',
    categories: ['university'],
    example: '/cpu/home',
    name: '最新公告',
    maintainers: ['kba977'],
    handler,
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.cpu.edu.cn';
    const url = `${baseUrl}/4133/list.htm`;
    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.col_news_list li.news')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.news_title a');
            return {
                title: a.attr('title') || a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('.news_meta').text()),
            };
        }) as DataItem[];

    const resultItem = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const detail = await ofetch(item.link!);
                    const $ = load(detail);

                    item.description = $('.wp_articlecontent').html() ?? $('.v_news_content').html();
                } catch {
                    // intranet
                }

                return item;
            })
        )
    );

    return {
        title: '中国药科大学 | 最新公告',
        link: url,
        item: resultItem as DataItem[],
        description: '中国药科大学 | 最新公告',
    };
}
