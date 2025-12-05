import dayjs from 'dayjs';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/express',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/techflowpost/express',
    radar: [
        {
            source: ['techflowpost.com/newsletter/index.html'],
        },
    ],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'techflowpost.com/',
};

async function handler(ctx) {
    const rootUrl = 'https://www.techflowpost.com';
    const currentUrl = `${rootUrl}/newsletter/index.html`;

    const { data: response } = await got.post('https://www.techflowpost.com/ashx/newflash_index.ashx', {
        form: {
            pageindex: 1,
            pagesize: ctx.req.query('limit') ?? 50,
            time: dayjs().format('YYYY/M/D HH:mm:ss'),
        },
    });

    const items = response.content.map((item) => ({
        title: item.stitle,
        link: `${rootUrl}/newsletter/detail_${item.nnewflash_id}.html`,
        pubDate: timezone(parseDate(item.dcreate_time), +8),
        updated: timezone(parseDate(item.dmodi_time), +8),
        description: item.scontent,
    }));

    return {
        title: '深潮TechFlow - 快讯',
        link: currentUrl,
        item: items,
    };
}
