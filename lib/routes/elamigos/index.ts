import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/games',
    categories: ['game'],
    example: '/elamigos/games',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['elamigos.site/', 'elamigos.site/index.html'],
            target: '/games',
        },
    ],
    name: 'Releases',
    maintainers: ['Kylon92'],
    handler,
    description: 'Latest game releases from ElAmigos',
};

async function handler(ctx: any) {
    const limit = getRouteLimit(ctx, 40);
    const baseUrl = 'https://elamigos.site';

    const { data: html } = await got(baseUrl);
    const $ = load(html);

    const games = extractGames($, limit, baseUrl);
    const items = await pMap(games, processGameItem, { concurrency: 3 });

    return {
        title: 'ElAmigos - Latest Games',
        link: baseUrl,
        description: `Latest game releases from ElAmigos (${items.length} entries)`,
        item: items,
    };
}

function toNeutralDate(input: string): Date {
    const [day, month, year] = input.split('.').map(Number);
    return parseDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`);
}

function extractGames($: any, limit: number, baseUrl: string): Array<{ title: string; link: string; pubDate: string }> {
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}/;
    const games: Array<{ title: string; link: string; pubDate: string }> = [];
    let catalogueDate = '';
    const seenLinks = new Set<string>();

    // Use the source's catalogue date label without inferring individual upload times.
    $('h1, h3, h5').each((_, elem) => {
        const $elem = $(elem);
        const tagName = elem.tagName.toLowerCase();

        if (tagName === 'h1') {
            const text = $elem.text().trim();
            const match = text.match(dateRegex);
            if (!match) {
                return;
            }
            catalogueDate = match[0];
        } else if ((tagName === 'h3' || tagName === 'h5') && catalogueDate) {
            const link = $elem.find('a[href]').first();
            if (!link.length || games.length >= limit) {
                return;
            }

            const href = link.attr('href');
            link.remove();
            const title = $elem.text();
            const fullLink = href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
            if (seenLinks.has(fullLink)) {
                return;
            }
            seenLinks.add(fullLink);
            games.push({ title, link: fullLink, pubDate: catalogueDate });
        }
    });

    return games;
}

function sanitizeHtml(pageHtml: string): string {
    const $page = load(pageHtml);

    $page('style, link, nav').remove();

    $page('*').each((_: number, elem: any) => {
        if (!elem.attribs) {
            return;
        }
        const attributes = Object.keys(elem.attribs);
        for (const attr of attributes) {
            if (attr.toLowerCase().startsWith('on')) {
                $page(elem).removeAttr(attr);
            }
        }
    });

    let contentHtml = $page('body').html() || '';
    contentHtml = contentHtml
        .replaceAll(/^\s*[\r\n]/gm, '')
        .replaceAll(/body\s*\{\s*margin-top:\s*1em;\s*\}/gi, '')
        .trim();

    return contentHtml;
}

async function processGameItem(game: { title: string; link: string; pubDate: string }): Promise<DataItem> {
    const contentHtml = await cache.tryGet(`elamigos:article:${game.link}`, async () => {
        const { data: pageHtml } = await got(game.link);
        return sanitizeHtml(pageHtml);
    });

    return {
        title: game.title,
        link: game.link,
        pubDate: toNeutralDate(game.pubDate).toUTCString(),
        description: contentHtml,
    };
}
