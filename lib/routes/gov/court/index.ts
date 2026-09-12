import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['government'],
    example: '/gov/court',
    name: '庭审回顾',
    maintainers: ['Fatpandac'],
    handler,
    url: 'tingshen.court.gov.cn',
};

const host = 'https://tingshen.court.gov.cn';

async function handler(ctx: Context) {
    const limit = ctx.req.query('limit');
    const data = await ofetch(`${host}/search/a/revmor/full`, {
        query: {
            dataType: 2,
            pageSize: limit ? Math.trunc(Number(limit)) : 10,
            pageNumber: 1,
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    return {
        title: '中国庭审公开网 - 庭审回顾',
        link: `${host}/search/full?address=/page/review/screenPage&dataType=2&pageSize=10`,
        item: data.resultList.map((item) => ({
            title: item.title,
            description: `<img src="${item.videoThumbnail}"><br>开庭法院：${item.courtName}<br>案号：${item.caseNo}<br>案由：${item.caseCause}<br>${item.judge}`,
            pubDate: parseDate(item.beginTime),
            link: `${host}/live/${item.caseId}`,
            author: item.courtName,
            category: item.caseCause,
        })),
    };
}
