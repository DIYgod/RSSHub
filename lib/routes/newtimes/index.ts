import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://www.newtimes.co.rw';
const listUrl = `${rootUrl}/news`;
const rootHost = 'newtimes.co.rw';
// /article/37279/news/energy/slug
const hrefPattern = /^\/article\/\d+(?:\/[a-z0-9-]+)*\/?$/i;

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/newtimes',
    radar: [{ source: ['newtimes.co.rw/', 'newtimes.co.rw/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'newtimes.co.rw/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const html = await ofetch(listUrl);
    const $ = load(html);
    const seen = new Set<string>();
    const items: Array<{ title: string; link: string }> = [];

    // Prefer article title links over scanning every anchor
    const anchors = $('.article-title a[href], a.article-title[href], .articles-list a[href*="/article/"]').toArray();
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
            title = a.closest('.article, .second-article, li, div').find('.article-title, h1, h2, h3').first().text().replaceAll(/\s+/g, ' ').trim() || title;
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
        title: 'The New Times',
        link: listUrl,
        language: 'en',
        item: items,
    };
}
