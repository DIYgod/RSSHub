import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/games/:limit?',
    categories: ['game'],
    example: '/elamigos/games',
    parameters: {
        limit: 'Number of games to fetch (default: 40, min: 20, max: 50)',
    },
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
    name: 'ElAmigos Releases',
    maintainers: ['Kylon92'],
    handler,
    description: 'Latest game releases from ElAmigos',
};

async function handler(ctx: any) {
    const limit = parseLimit(ctx);
    const baseUrl = 'https://elamigos.site';

    const { data: html } = await got(baseUrl);
    const $ = load(html);

    const games = extractGames($, limit, baseUrl);
    const items = await Promise.all(games.map((game) => processGameItem(game)));

    return {
        title: 'ElAmigos - Latest Games',
        link: baseUrl,
        description: `Latest game releases from ElAmigos (${items.length} entries)`,
        item: items,
    };
}

function toNeutralDate(input: string, appendDay: boolean = false): Date {
    const [day, month, year] = input.split('.').map(Number);
    const baseDate = new Date(Date.UTC(year, month - 1, day));
    return appendDay ? new Date(baseDate.getTime() + 24 * 60 * 60 * 1000) : baseDate;
}

function parseLimit(ctx: any): number {
    const rawLimit = ctx.req.param('limit');
    const limit_min = 20;
    const limit_max = 50;
    let limit = 40;

    if (rawLimit) {
        const parsed = Number.parseInt(rawLimit, 10);
        if (!Number.isNaN(parsed)) {
            limit = Math.max(limit_min, Math.min(limit_max, parsed));
        }
    }
    return limit;
}

function extractGames($: any, limit: number, baseUrl: string): Array<{ title: string; link: string; pubDate: string | null }> {
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    const games: Array<{ title: string; link: string; pubDate: string | null }> = [];
    let arrivedAtGameSection = false;

    // Extract games with their publication dates based on H1 week markers
    // We ignore the first H1 Date as that tells us the current Release Week of ElAmigos
    // They just auto-update that Date and keep all Games released under that H1 Tag for the week
    // So the best workaround to fill the Publish Date is to look for the next H1 Date Tag and append a Day to that Date.
    $('h1, h3, h5').each((_, elem) => {
        const $elem = $(elem);
        const tagName = elem.tagName.toLowerCase();

        if (tagName === 'h1') {
            const text = $elem.text().trim();
            if (!dateRegex.test(text)) {
                return;
            }
            arrivedAtGameSection = true;
            let anyGameUpdated = false;
            // Found H1 date, fill all empty Games with the new Date.
            for (const game of games) {
                if (game.pubDate === null || game.pubDate.trim() === '') {
                    game.pubDate = text;
                    anyGameUpdated = true;
                }
            }
            if (games.length >= limit && !anyGameUpdated) {
                return false;
            } // We are done Parsing. Exit and Continue.
        }

        if (games.length >= limit) {
            return;
        } // We have reached the limit. Do not add new Entries, however we need to keep looping to get the Date for the Last Games
        if ((tagName === 'h3' || tagName === 'h5') && arrivedAtGameSection) {
            const link = $elem.find('a[href]').first();
            if (!link.length) {
                return;
            }

            const href = link.attr('href');

            if (!href?.includes('data/') || href.includes('how2download') || href.includes('Contact')) {
                return;
            }

            let title = '';
            $elem.contents().each((_, node) => {
                if (node.nodeType === 3) {
                    title += node.nodeValue;
                }
            });
            title = title.trim().replace(/\s+ElAmigos\s*$/i, '');

            if (title && games.length < limit) {
                const fullLink = href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
                games.push({ title, link: fullLink, pubDate: null });
            }
        }
    });

    return games;
}

function extractLatestDate(pageHtml: string): Date | null {
    const dateMatches = pageHtml.match(/\b\d{2}\.\d{2}\.\d{4}\b/g) || [];
    const uniqueDates = [...new Set(dateMatches)];

    let newestDate: Date | null = null;

    for (const dateStr of uniqueDates) {
        const parsedDate = toNeutralDate(dateStr);
        if (newestDate === null || parsedDate > newestDate) {
            newestDate = parsedDate;
        }
    }

    return newestDate;
}

function sanitizeHtml(pageHtml: string): string {
    const $page = load(pageHtml);

    $page('script, style, link, nav').remove();

    $page('*').each((_: number, elem: any) => {
        if (elem.attribs) {
            const attributes = Object.keys(elem.attribs);
            for (const attr of attributes) {
                if (attr.toLowerCase().startsWith('on')) {
                    $page(elem).removeAttr(attr);
                }
            }
        }
    });

    let contentHtml = $page('body').html() || '';
    contentHtml = contentHtml
        .replaceAll(/^\s*[\r\n]/gm, '')
        .replaceAll(/body\s*\{\s*margin-top:\s*1em;\s*\}/gi, '')
        .trim();

    return contentHtml.slice(0, 8000);
}

function processGameItem(game: { title: string; link: string; pubDate: string | null }): Promise<DataItem> {
    const cacheKey = `elamigos:${game.link}`;

    return cache.tryGet(
        cacheKey,
        async () => {
            try {
                const { data: pageHtml } = await got(game.link, {
                    timeout: 15000,
                });

                const newestDate = extractLatestDate(pageHtml);

                let finalPublishDate: Date | null = null;
                if (game.pubDate) {
                    finalPublishDate = toNeutralDate(game.pubDate, true);
                }

                if (finalPublishDate === null || (newestDate !== null && newestDate > finalPublishDate)) {
                    finalPublishDate = newestDate;
                }

                if (finalPublishDate === null) {
                    finalPublishDate = new Date();
                }

                const contentHtml = sanitizeHtml(pageHtml);

                return {
                    title: game.title,
                    link: game.link,
                    pubDate: finalPublishDate.toUTCString(),
                    description: contentHtml,
                } as DataItem;
            } catch {
                return {
                    title: game.title,
                    link: game.link,
                    pubDate: new Date(),
                    description: `<p>View game page: <a href="${game.link}">${game.link}</a></p>`,
                } as DataItem;
            }
        },
        12 * 60 * 60 // Cache for 12 hours. Data Pages are very static, can probably increase to 24hrs if need be.
    );
}
