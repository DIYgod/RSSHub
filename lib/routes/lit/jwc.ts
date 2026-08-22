import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/lit/jwc',
    name: '教务处',
    maintainers: ['vhxubo'],
    handler,
};

const baseUrl = 'https://www.lit.edu.cn/jwc/';

async function handler(): Promise<Data> {
    const response = await ofetch(`${baseUrl}xb2024.htm`);

    const $ = load(response);

    const list = $('.news-content')
        .toArray()
        .map((item) => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const result = await ofetch(item.link!);
                const $ = load(result);

                const meta = $('.content-title span:last-child').text();

                item.title = $('.content-title span:first-child').text();
                item.description = $('.v_news_content').html();
                item.pubDate = timezone(parseDate(meta.match(/时间：(\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})/)?.[1] ?? '', 'YYYY年MM月DD日 HH:mm'), 8);
                item.author = meta.match(/作者：(\S+)/)?.[1];

                return item;
            })
        )
    );

    return {
        title: '教务处 - 洛阳理工学院',
        link: baseUrl,
        description: '洛阳理工教务在线 RSS',
        item: items as DataItem[],
    };
}
