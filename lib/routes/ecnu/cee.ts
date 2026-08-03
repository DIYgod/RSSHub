import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cee',
    categories: ['university'],
    example: '/ecnu/cee',
    radar: [
        {
            source: ['ieeic.ecnu.edu.cn'],
            target: '/cee',
        },
    ],
    name: '通信与电子工程学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://ieeic.ecnu.edu.cn/';

        const response = await got(`${baseUrl}tzgg_4170/list.htm`);
        const $ = load(response.data);
        const links = $('ul.news_list.list2 > li')
            .toArray()
            .map((el): DataItem & { link: string } => ({
                pubDate: timezone(parseDate($(el).find('.news_date').text()), 8),
                link: new URL($(el).find('a').attr('href')!, baseUrl).href,
                title: $(el).find('.news_title').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data } = await got(item.link);
                    const $ = load(data);
                    const $read = $('div.read');
                    item.description = $read.html()?.trim();
                    return item;
                })
            )
        );

        return {
            title: '通信与电子工程学院通知公告',
            link: 'https://ieeic.ecnu.edu.cn/tzgg_4170/list.htm',
            item: items,
        };
    },
};
