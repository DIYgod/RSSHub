import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://www.gdnonline.com';
const hrefPattern = /^\/Details\/\d+\//;

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/gdnonline',
    radar: [{ source: ['gdnonline.com/', 'gdnonline.com/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'gdnonline.com/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const html = await ofetch(rootUrl);
    const $ = load(html);
    const seen = new Set<string>();
    const items: Array<{ title: string; link: string }> = [];

    for (const el of $('a[href]').toArray()) {
        const a = $(el);
        const href = a.attr('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript')) {
            continue;
        }
        let link: string;
        try {
            link = new URL(href, rootUrl).href;
        } catch {
            continue;
        }
        try {
            const host = new URL(link).hostname.replace(/^www\./, '');
            const rootHost = new URL(rootUrl).hostname.replace(/^www\./, '');
            if (host !== rootHost && !host.endsWith('.' + rootHost)) {
                continue;
            }
        } catch {
            continue;
        }
        const path = new URL(link).pathname;
        if (!hrefPattern.test(path) && !hrefPattern.test(href)) {
            continue;
        }
        if (seen.has(link)) {
            continue;
        }
        const title = a.text().replaceAll(/\s+/g, ' ').trim() || a.attr('title')?.trim();
        if (!title || title.length < 8) {
            continue;
        }
        seen.add(link);
        items.push({ title, link });
        if (items.length >= limit) {
            break;
        }
    }

    return {
        title: 'Gulf Daily News',
        link: rootUrl,
        language: 'en',
        item: items,
    };
}
