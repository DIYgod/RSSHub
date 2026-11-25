import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/journal/:type?',
    categories: ['bbs'],
    example: '/muchong/journal',
    parameters: { type: '类型，见下表' },
    features: { antiCrawler: true },
    name: '期刊点评',
    maintainers: ['nczitzk'],
    description: `| SCI 期刊 | 中文期刊 |
| -------- | -------- |
|          | cn       |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = '' } = ctx.req.param();

    const rootUrl = 'http://muchong.com';
    const decoder = new TextDecoder('gbk');
    const currentUrl = `${rootUrl}/${type === '' ? 'bbs/journal' : 'journal_cn'}.php`;

    const response = await ofetch(currentUrl, { responseType: 'arrayBuffer' });
    const $ = load(decoder.decode(response));

    const seenLinks = new Set<string>();
    const list = $('.jname a, .journal_list a')
        .slice(0, 15)
        .toArray()
        .map((element): DataItem & { link: string } => {
            const $item = $(element);
            const link = $item.attr('href')!;
            return {
                title: $item.text(),
                link: new URL(link, `${rootUrl}/bbs/`).href,
            };
        })
        .filter((item) => {
            if (seenLinks.has(item.link)) {
                return false;
            }
            seenLinks.add(item.link);
            return true;
        });

    const items = await pMap(
        list,
        async (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'muchong.com')) {
                return item;
            }
            const details = await cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, { responseType: 'arrayBuffer' });
                const content = load(decoder.decode(detailResponse));

                const description = content('.forum_explan dl table').eq(1).html();

                return { description };
            });
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
