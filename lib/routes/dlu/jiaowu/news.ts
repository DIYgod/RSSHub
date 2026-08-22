import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://jwc1.dlu.edu.cn/';

export const route: Route = {
    path: '/jiaowu/news',
    categories: ['university'],
    example: '/dlu/jiaowu/news',
    name: '教务处信息',
    maintainers: ['SettingDust'],
    handler,
};

async function handler() {
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const items = $('td[valign="top"]>table[cellspacing="3"][width="100%"] tr')
        .toArray()
        .map((elem) => {
            const a = $('a', elem);
            const link = new URL(a.attr('href')!, baseUrl).href;
            return cache.tryGet(link, async () => {
                const detailResponse = await ofetch(link);
                const article = load(detailResponse);
                return {
                    link,
                    title: a.attr('title'),
                    pubDate: timezone(parseDate(article('td[height="28"]').text(), 'YYYY年MM月DD日 HH:mm'), 8),
                    description: article('form[name="_newscontent_fromname"] > div > *:not(table)')
                        .toArray()
                        .map((it) => article(it).html())
                        .join('\n'),
                };
            });
        });

    return {
        link: baseUrl,
        title: '大连大学教务处',
        item: (await Promise.all(items)) as DataItem[],
    };
}
