import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://career.cic.tsinghua.edu.cn/';
const path = 'xsglxt/f/jyxt/anony/xxfb';

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
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');

            return {
                title: a.text(),
                link: new URL(a.attr('ahref')!, baseUrl).href,
                pubDate: parseDate($item.find('span').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $detail = load(detailResponse);

                return {
                    ...item,
                    description: $detail('div.sideleft.left, div.content.teacher').html(),
                };
            })
        )
    );

    return {
        title: '清华大学 - 招聘信息',
        link,
        description: '清华大学学生职业发展指导中心 - 招聘信息',
        item: items,
    };
}
