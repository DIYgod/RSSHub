import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

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
    const limit = Number(ctx.req.query('limit')) || 40;
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
            // Found H1 date, fill all empty Games with the new Date.
            for (const game of games) {
                if (game.pubDate === null || game.pubDate.trim() === '') {
                    game.pubDate = text;
                }
            }
        } else if ((tagName === 'h3' || tagName === 'h5') && arrivedAtGameSection) {
            const link = $elem.find('a[href]').first();
            if (!link.length || games.length >= limit) {
                return;
            }

            const href = link.attr('href');
            const title = $elem.text().replaceAll('DOWNLOAD', '').trim();
            const fullLink = href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
            games.push({ title, link: fullLink, pubDate: null });
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

    return contentHtml;
}

function processGameItem(game: { title: string; link: string; pubDate: string | null }): Promise<DataItem> {
    const cacheKey = `elamigos:${game.link}`;

    return cache.tryGet(cacheKey, async () => {
        try {
            const { data: pageHtml } = await got(game.link);

            const newestDate = extractLatestDate(pageHtml);
            // If the Data Page has a newer Date than what we got from the Main Page, we take it instead.
            let finalPublishDate: Date | null = null;
            if (game.pubDate) {
                finalPublishDate = toNeutralDate(game.pubDate, true);
            }

            if (finalPublishDate === null || (newestDate !== null && newestDate > finalPublishDate)) {
                finalPublishDate = newestDate;
            }
            const contentHtml = sanitizeHtml(pageHtml);

            return {
                title: game.title,
                link: game.link,
                pubDate: finalPublishDate === null ? undefined : finalPublishDate.toUTCString(),
                description: contentHtml,
            } as DataItem;
        } catch {
            return {
                title: game.title,
                link: game.link,
                description: `<p>View game page: <a href="${game.link}">${game.link}</a></p>`,
            } as DataItem;
        }
    });
}
