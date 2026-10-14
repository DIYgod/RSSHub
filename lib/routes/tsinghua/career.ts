import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://career.cic.tsinghua.edu.cn/';
const path = 'xsglxt/f/jyxt/anony/xxfb';

async function fetchArticleDetails(link: string): Promise<Pick<DataItem, 'description'>> {
    const response = await ofetch(link);
    const $ = load(response);
    const main = $('div.sideleft.left');

    return {
        description: (main.length ? main : $('div.content.teacher')).html(),
    };
}

export const route: Route = {
    path: '/career',
    categories: ['university'],
    example: '/tsinghua/career',
    name: '招聘信息',
    maintainers: ['Halcao', 'DylanXie123'],
    handler,
};

async function handler() {
    const link = baseUrl + path;
    const response = await ofetch(link, {
        method: 'POST',
        body: new URLSearchParams({ pgno: '1' }),
    });
    const $ = load(response);

    const list = $('#ts_div .list li')
        .toArray()
        .filter((item) => $(item).find('a').attr('ahref'))
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            const date = $item.find('span').text();

            return {
                title: a.text(),
                link: new URL(a.attr('ahref')!, baseUrl).href,
                pubDate: date ? timezone(parseDate(date, 'YYYY.MM.DD'), 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link, () => fetchArticleDetails(item.link));

            return { ...item, description: details.description };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: '清华大学 - 招聘信息',
        link,
        description: '清华大学学生职业发展指导中心 - 招聘信息',
        item: items,
    };
}
