import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { processItems } from './utils';

const host = 'http://www.pbc.gov.cn';

export const route: Route = {
    path: '/pbc/zcyj',
    radar: [
        {
            source: ['pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html'],
        },
    ],
    name: 'Unknown',
    maintainers: ['Fatpandac'],
    handler,
    url: 'pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html',
};

async function handler() {
    const url = `${host}/redianzhuanti/118742/4122386/4122510/index.html`;

    const response = await got.post(url);
    const $ = load(response.data);
    const list = $('li.clearfix')
        .toArray()
        .map((item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
            pubDate: timezone(parseDate($(item).find('span.fr').text(), 'YYYY-MM-DD'), +8),
        }));

    const items = await processItems(list);

    return {
        title: '中国人民银行 政策研究',
        link: url,
        item: items,
    };
}
