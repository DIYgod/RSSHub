import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

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
    const { year = Temporal.Now.zonedDateTimeISO('UTC').year } = ctx.req.param();

    const rootUrl = 'https://www.wto.org';
    const currentUrl = `${rootUrl}/library/news/news_${year}_e.js`;
    const response = await ofetch<string>(currentUrl, { parseResponse: (txt) => txt });

    const data = response.split('] = {');

    data.shift();

    const list = data
        .filter((item) =>
            item
                .match(/ni_subject:"(.*)",/)![1]
                .split('#')
                .includes('DISP')
        )
        .map((item) => {
            item = '{' + item.split('news_item[', 1)[0].replace('};', '}');
            return {
                title: item.match(/ni_head:"(.*)",/)![1],
                link: new URL(item.match(/nl_url:"(.*)",/)![1], rootUrl).href,
                description: item.match(/ni_intro:"(.*)",/)![1],
                pubDate: parseDateStrict(
                    item
                        .match(/ni_date:"(.*)",/)![1]
                        .replaceAll('.', '-')
                        .replace('_', ' '),
                    'YYYY-MM-DD HH:mm:ss'
                ),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const bytes = await ofetch<ArrayBuffer, 'arrayBuffer'>(item.link, { responseType: 'arrayBuffer' });
                const header = new TextDecoder().decode(bytes.slice(0, 4096));
                const charset = header.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i)?.[1] || 'utf-8';
                const $ = load(new TextDecoder(charset).decode(bytes));
                return { description: $('#mainContent').html() } satisfies Pick<DataItem, 'description'>;
            });
            return { ...item, description: `<p>${item.description}</p>${detail.description}` };
        },
        { concurrency: 3 }
    );

    return {
        title: `Dispute settlement news archive ${year} - WTO`,
        link: `${rootUrl}/english/news_e/archive_e/dis_arc_e.htm`,
        item: items,
    };
}
