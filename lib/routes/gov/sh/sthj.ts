import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/sthj',
    categories: ['forecast'],
    example: '/gov/sh/sthj',
    name: '空气质量',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://link.sthj.sh.gov.cn/aqi/index.jsp';
    const response = await ofetch(link);
    const $ = load(response);
    const aqi = $('div.val').text();
    const time = `${new Date().getFullYear()}-${$('span.t-time').eq(0).text().replaceAll(/\s+/g, '').replace('月', '-').replace('日', ' ').replace('时', ':00:00')}`;

    return {
        title: '上海市生态环境局 - 空气质量',
        link,
        item: [
            {
                title: `${aqi} - ${time}`,
                link,
                description: $('table.table').html()! + $('div.air-yb').html(),
                pubDate: timezone(parseDate(time), 8),
            },
        ],
    };
}
