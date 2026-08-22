import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/cpu/jwc',
    name: '教务处',
    maintainers: ['kba977'],
    handler,
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://jwc.cpu.edu.cn';
    const url = `${baseUrl}/851/list.htm`;
    const response = await ofetch(url);
    const $ = load(response);

    const list: DataItem[] = $('div#wp_news_w6 ul.news_list li')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            return {
                title: $link.attr('title')!,
                link: new URL($link.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('span.news_meta').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await ofetch(item.link!);
                const $ = load(detail);

                item.description = $('div.article').html();

                return item;
            })
        )
    );

    return {
        title: '中国药科大学 - 教务处 | 最新通知',
        link: url,
        item: items,
        description: '中国药科大学 | 教务处',
    };
}
