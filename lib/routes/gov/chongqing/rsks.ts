import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rsksUrl = 'https://rlsbj.cq.gov.cn/ywzl/rsks/tzgg_109374/';
export const route: Route = {
    path: '/rsks',
    categories: ['government'],
    example: '/gov/chongqing/rsks',
    radar: [
        {
            source: ['rlsbj.cq.gov.cn/'],
        },
    ],
    name: '人力社保局 - 人事考试通知',
    maintainers: ['Mai19930513'],
    handler,
    url: 'rlsbj.cq.gov.cn/',
};

async function handler() {
    const { data: response } = await got(rsksUrl);
    const $ = load(response);
    // Read the current notice list.
    const list = $('ul.rsj-list1 > li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const title = $item.find('a').first();
            const pubDate = $item.find('span').text();
            return {
                title: title.text(),
                link: new URL(title.attr('href')!, rsksUrl).href,
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
            };
        });

    // Fetch the notice details.
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                const pubDate = $('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate), 8);
                }
                item.description = $('.trs_editor_view').first().html();
                return item;
            })
        )
    );
    return {
        title: '重庆人事考试通知公告',
        link: rsksUrl,
        item: items,
    };
}
