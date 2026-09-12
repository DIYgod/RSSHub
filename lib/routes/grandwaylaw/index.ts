import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/grandwaylaw',
    radar: [
        {
            source: ['www.grandwaylaw.com/guofengshijiao'],
        },
    ],
    name: '国枫视角',
    maintainers: ['snipersteve'],
    handler,
    url: 'www.grandwaylaw.com/guofengshijiao/',
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.grandwaylaw.com';
    const link = `${baseUrl}/guofengshijiao/`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('ul.hmNews li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const a = $(item).find('a');
            const date = a.find('span');
            const pubDate = timezone(parseDate(date.text(), 'YYYY.MM.DD'), 8);
            date.remove();
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate,
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.arCon').html()?.trim();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        language: 'zh',
        item: out,
    };
}
