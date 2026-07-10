import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://www.listindiario.com';
const rootHost = 'listindiario.com';
// /section/.../20260710/slug_913293.html
const hrefPattern = /\/\d{8}\/[^/]+_\d+\.html?$/i;

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/listindiario',
    radar: [{ source: ['listindiario.com/', 'listindiario.com/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'listindiario.com/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const html = await ofetch(rootUrl);
    const $ = load(html);
    const seen = new Set<string>();
    const items: Array<{ title: string; link: string }> = [];

    // Prefer article cards over scanning every anchor on the page
    const anchors = $('.c-article a[href], a.c-article__title[href]').toArray();
    for (const el of anchors) {
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
            if (host !== rootHost && !host.endsWith('.' + rootHost)) {
                continue;
            }
        } catch {
            continue;
        }
        const path = new URL(link).pathname;
        if (!hrefPattern.test(path)) {
            continue;
        }
        if (seen.has(link)) {
            continue;
        }
        let title = a.attr('title')?.trim() || a.text().replaceAll(/\s+/g, ' ').trim();
        if (!title || title.length < 10) {
            title = a.closest('.c-article, article, li, div').find('.c-article__title, h1, h2, h3').first().text().replaceAll(/\s+/g, ' ').trim() || title;
        }
        if (!title || title.length < 10) {
            continue;
        }
        seen.add(link);
        items.push({ title, link });
        if (items.length >= limit) {
            break;
        }
    }

    return {
        title: 'Listín Diario',
        link: rootUrl,
        language: 'es',
        item: items,
    };
}
