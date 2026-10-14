import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';

import { ContentFetcher } from './utils';

export const route: Route = {
    path: '/journal/:type?',
    categories: ['bbs'],
    example: '/muchong/journal',
    parameters: { type: '类型，见下表' },
    features: { requirePuppeteer: true, antiCrawler: true },
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

    const fetcher = new ContentFetcher();
    try {
        const response = await fetcher.fetch(currentUrl);
        const $ = load(typeof response === 'string' ? response : decoder.decode(response));

        const seenLinks = new Set<string>();
        const list = $('.jname a, .journal_list a')
            .slice(0, 15)
            .toArray()
            .map((element): DataItem & { link: string } => {
                const $item = $(element);
                const link = $item.attr('href')!;
                return {
                    title: $item.text(),
                    link: link.includes('http') ? link : `${rootUrl}/bbs/${link}`,
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
                const details = await cache.tryGet(item.link, async () => {
                    const detailResponse = await fetcher.fetch(item.link);
                    const content = load(typeof detailResponse === 'string' ? detailResponse : decoder.decode(detailResponse));

                    const description = content('.forum_explan dl table').eq(1).html();

                    return { description };
                });
                return { ...item, description: details.description };
            },
            { concurrency: 3, stopOnError: false }
        );

        return {
            title: $('title').text(),
            link: currentUrl,
            item: items,
        };
    } catch (error) {
        if (error instanceof AggregateError && error.errors.length) {
            throw error.errors[0];
        }
        throw error;
    } finally {
        await fetcher.destroy();
    }
}
