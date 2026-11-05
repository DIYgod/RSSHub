import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/reactnativenewsletter',
    radar: [
        {
            source: ['reactnativenewsletter.com/past-issues', 'reactnativenewsletter.com/'],
            target: '',
        },
    ],
    name: 'Past Issues',
    maintainers: ['yiuyiu'],
    handler,
    url: 'reactnativenewsletter.com/past-issues',
};

async function handler(ctx: Context): Promise<Data> {
    const baseUrl = 'https://reactnativenewsletter.com';
    const link = `${baseUrl}/past-issues`;

    const response = await ofetch(link);
    const $ = load(response);

    const archiveUrls = [
        ...new Set(
            $('.campaign__list__year script[src*="generate-js"]')
                .toArray()
                .map((script) => new URL($(script).attr('src')!, baseUrl).href)
        ),
    ];

    const archives = await Promise.all(archiveUrls.map((url) => ofetch<string>(url)));

    const list = archives
        .flatMap((archive) => {
            const $$ = load(JSON.parse(archive.match(/document\.write\((".*")\);/s)![1]));
            return $$('.campaign')
                .toArray()
                .map((item) => {
                    const $item = $$(item);
                    const a = $item.find('a');
                    const href = a.attr('href');
                    if (!href) {
                        throw new Error('React Native Newsletter issue link is missing');
                    }
                    const date = $item.text().split(' - ', 1)[0];
                    return {
                        title: a.text(),
                        link: new URL(href, baseUrl).href,
                        pubDate: date ? parseDate(`${date} +0000`, 'MM/DD/YYYY ZZ') : undefined,
                    };
                });
        })
        .toSorted((a, b) => (b.pubDate?.valueOf() ?? 0) - (a.pubDate?.valueOf() ?? 0))
        .slice(0, getRouteLimit(ctx, 20));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`reactnativenewsletter:issue:v3:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const description = $('#templateBody').html();
                if (!description) {
                    throw new Error('React Native Newsletter issue content is missing');
                }
                return { ...item, description };
            }),
        { concurrency: 6 }
    );

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        language: 'en',
        item: items,
    };
}
