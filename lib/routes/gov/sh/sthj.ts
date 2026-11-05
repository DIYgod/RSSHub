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
    const time = /\blastLstAqiStr\s*=\s*["'](\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})["']/.exec(response)?.[1];
    if (!time) {
        throw new Error('The air quality source did not provide its full measurement timestamp.');
    }

    return {
        title: '上海市生态环境局 - 空气质量',
        link,
        item: [
            {
                title: `${aqi} - ${time}`,
                link,
                description: $('table.table').html()! + $('div.air-yb').html(),
                pubDate: timezone(parseDate(time, 'YYYY-MM-DD HH:mm:ss', true), 8),
            },
        ],
    };
}
