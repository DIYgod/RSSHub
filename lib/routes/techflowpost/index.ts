import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    example: '/techflowpost',
    radar: [
        {
            source: ['techflowpost.com/'],
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'techflowpost.com/',
};

async function handler(ctx) {
    const rootUrl = 'https://www.techflowpost.com';

    const { data: response } = await got.post('https://www.techflowpost.com/ashx/index.ashx', {
        form: {
            pageindex: 1,
            pagesize: ctx.req.query('limit') ?? 50,
        },
    });

    const items = response.content.map((item) => ({
        title: item.stitle,
        author: item.sauthor_name,
        link: `${rootUrl}/article/detail_${item.narticle_id}.html`,
        category: [item.new_scata_name],
        pubDate: timezone(parseDate(item.dcreate_time), +8),
        updated: timezone(parseDate(item.dmodi_time), +8),
        description: item.scontent,
    }));

    return {
        title: '深潮TechFlow',
        link: rootUrl,
        item: items,
    };
}
