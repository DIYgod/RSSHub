import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/ahmu/news',
    radar: [
        {
            source: ['yjsxy.ahmu.edu.cn/tzgg/list.htm'],
        },
    ],
    name: '研究生学院通知公告',
    maintainers: ['Origami404'],
    handler,
    url: 'yjsxy.ahmu.edu.cn/tzgg/list.htm',
};

async function handler() {
    const baseUrl = 'https://yjsxy.ahmu.edu.cn';
    const link = `${baseUrl}/tzgg/list.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.news_list li.cle')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.text').text().trim(),
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
                author: '安徽医科大学研究生学院',
                pubDate: timezone(parseDate($item.find('.time').text(), 'YYYY-MM-DD'), 8),
            };
        }) as DataItem[];

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: '安徽医科大学研究生学院 - 通知公告',
        link,
        item: result,
    };
}
