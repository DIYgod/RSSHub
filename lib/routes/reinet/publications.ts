import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.reinet.or.jp';
const link = `${baseUrl}/publications/`;

export const route: Route = {
    path: '/publications',
    name: '公表資料・刊行物',
    categories: ['finance'],
    example: '/reinet/publications',
    maintainers: ['pentaoa'],
    description: 'Published reports, publication announcements, and columns from the Japan Real Estate Institute, including links to public PDF reports.',
    radar: [
        {
            source: ['www.reinet.or.jp/publications/', 'www.reinet.or.jp/visitors-report.html'],
            target: '/publications',
        },
    ],
    handler,
};

async function handler() {
    const response = await ofetch<string>(link);
    const $ = load(response);
    const items = $('.archive__past .dl-tableList02 dd')
        .toArray()
        .map((element) => {
            const entry = $(element);
            const anchor = entry.find('a');
            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate(entry.prev('dt').text().trim(), 'YYYY/MM/DD'), 9),
            };
        });

    return {
        title: '日本不動産研究所 - 公表資料・刊行物',
        link,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detail = await ofetch<string>(item.link);
                    const $detail = load(detail);
                    return { ...item, description: $detail('.wp_content__inner').html()! };
                })
            )
        ),
    };
}
