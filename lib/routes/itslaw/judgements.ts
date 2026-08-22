import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/judgements/:conditions',
    categories: ['other'],
    example: '/itslaw/judgements/regulation+1121495748+13+中华人民共和国公司法（2018）第二十一条',
    parameters: { conditions: '筛选条件，见示例' },
    name: '案例',
    maintainers: ['harveyqiu'],
    handler,
};

async function handler(ctx: Context) {
    const { conditions = '' } = ctx.req.param();
    const pageUrl = 'http://www.itslaw.com/';

    const data = await ofetch(`https://www.itslaw.com/api/judgements?sortType=2&category=CASE&startIndex=0&countPerPage=20&conditions=${encodeURIComponent(conditions)}`);

    const items = data.data.searchResult.judgements.map((item) => {
        const initialization = `{"category":"CASE","id":"${item.id}","anchor":null,"detailKeyWords":[""]}`;
        return {
            title: item.title,
            description: item.courtOpinion,
            pubDate: parseDate(item.publishDate),
            link: `https://www.itslaw.com/detail?initialization=${encodeURIComponent(initialization)}`,
        };
    });

    return {
        title: `无讼案例 - ${conditions}`,
        link: pageUrl,
        item: items,
    };
}
