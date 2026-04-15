import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.anthropic.com';
const targetUrl = `${baseUrl}/science`;

export const route: Route = {
    path: '/science',
    categories: ['programming'],
    example: '/anthropic/science',
    name: 'Science',
    maintainers: ['ttttmr'],
    handler,
    radar: [
        {
            source: ['www.anthropic.com/science'],
            target: '/science',
        },
    ],
    url: 'www.anthropic.com/science',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const response = await ofetch(targetUrl);
    const $ = load(response);

    const list: DataItem[] = $('#main-content a[href^="/research/"]')
        .toArray()
        .map((element) => {
            const $element = $(element);
            const text = $element.text().trim().replaceAll(/\s+/g, ' ');
            const match = text.match(/^(?<date>[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+Science\s+(?<title>.+)$/);
            const title = match?.groups?.title ?? text;
            const date = match?.groups?.date;

            return {
                title,
                pubDate: date ? parseDate(date) : undefined,
                link: new URL($element.attr('href') ?? '', baseUrl).href,
            };
        })
        .filter((item, index, items) => item.title && item.link && items.findIndex((other) => other.link === item.link) === index)
        .slice(0, limit);

    const item = await pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                const detail = await ofetch(entry.link!);
                const $$ = load(detail);
                const article = $$('#main-content article').first();
                article.find('[class*="__socialShare"], [class*="__sidebar"], [class*="__header"]').remove();
                entry.description = article.html() ?? undefined;
                return entry;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Science',
        description: $('meta[name="description"]').attr('content') ?? 'Science updates from Anthropic',
        link: targetUrl,
        item,
    };
}
