import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://www.xinhuanet.com';
const rootHost = 'xinhuanet.com';
const hrefPattern = /\/\d{6,}/;

const registrable = (h: string) => h.split('.').slice(-2).join('.');

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/xinhuanet',
    radar: [{ source: ['xinhuanet.com/', 'xinhuanet.com/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'xinhuanet.com/',
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
            const hostName = new URL(link).hostname.replace(/^www\./, '');
            if (hostName !== rootHost && !hostName.endsWith('.' + rootHost) && registrable(hostName) !== registrable(rootHost)) {
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
        let title = a.attr('title')?.trim() || a.text().replaceAll(/\s+/g, ' ').trim();
        if (!title || title.length < 10) {
            title = a.closest('article, li, div').find('h1, h2, h3, h4').first().text().replaceAll(/\s+/g, ' ').trim() || title;
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
        title: '新华社',
        link: rootUrl,
        language: 'en',
        item: items,
    };
}
