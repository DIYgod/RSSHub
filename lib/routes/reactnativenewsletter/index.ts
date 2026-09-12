import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
                    return {
                        title: a.text(),
                        link: a.attr('href'),
                        pubDate: parseDate($item.text().split(' - ', 1)[0], 'MM/DD/YYYY'),
                    };
                });
        })
        .toSorted((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                return {
                    ...item,
                    description: $('#templateBody').html(),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        language: 'en',
        item: items,
    };
}
