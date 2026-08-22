import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/dispute-settlement/:year?',
    categories: ['government'],
    example: '/wto/dispute-settlement',
    parameters: { year: 'Year, current year by default' },
    name: 'Dispute settlement news',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { year = new Date().getFullYear() } = ctx.req.param();

    const rootUrl = 'https://www.wto.org';
    const currentUrl = `${rootUrl}/library/news/news_${year}_e.js`;
    const response = await ofetch<string>(currentUrl, { parseResponse: (txt) => txt });

    const data = response.split('] = {');

    data.shift();

    const items = data.map((item) => {
        item = '{' + item.split('news_item[', 1)[0].replace('};', '}');
        return {
            title: item.match(/ni_head:"(.*)",/)![1],
            link: item.match(/nl_url:"(.*)",/)![1],
            description: item.match(/ni_intro:"(.*)",/)![1],
            pubDate: parseDate(
                item
                    .match(/ni_date:"(.*)",/)![1]
                    .replaceAll('.', '-')
                    .replace('_', ' ')
            ),
        };
    });

    return {
        title: `Dispute settlement news archive ${year} - WTO`,
        link: `${rootUrl}/english/news_e/archive_e/dis_arc_e.htm`,
        item: items,
    };
}
