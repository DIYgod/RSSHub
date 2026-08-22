import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/jgsu/jwc',
    name: '教务处通知',
    maintainers: ['butten42'],
    handler,
};

const baseUrl = 'https://jwc.jgsu.edu.cn/xxgk2/jwtz.htm';

async function handler() {
    const response = await ofetch(baseUrl);
    const $ = load(response);

    return {
        link: baseUrl,
        title: '井冈山大学教务处',
        item: $('.xn_c_sv_20_li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    link: new URL($item.find('.xn_c_sv_20_top a').attr('href')!, baseUrl).href,
                    title: $item.find('.xn_c_sv_20_top a').text(),
                    description: $item.find('.xn_c_sv_20_text').text().trim(),
                    pubDate: timezone(parseDate($item.find('.time').text().replaceAll(/[[\]]/g, '')), 8),
                };
            }) as DataItem[],
    };
}
