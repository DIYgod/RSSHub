import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/depth',
    categories: ['study'],
    example: '/zhishifenzi/depth',
    name: 'depth',
    maintainers: ['y9c'],
    handler,
};

const base = 'https://zhishifenzi.com';

async function handler() {
    const link = `${base}/depth/`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('div.inner_depth_list > ul > li')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            return {
                title: $elem.find('h5 > a').text(),
                pubDate: parseRelativeDate($elem.find('div.inner_depth_list_tags > p').first().text()),
                link: new URL($elem.find('h5 > a').attr('href')!, base).href,
            };
        }) as DataItem[];

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const detailCapture = load(detailResponse);

                item.description = detailCapture('.main div.inner_content').html();

                return item;
            })
        )
    );

    return {
        title: '知識分子 | 深度',
        description: '知識分子 | 科學 文明 智慧',
        link,
        item: out,
    };
}
