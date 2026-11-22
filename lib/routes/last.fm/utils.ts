import { load } from 'cheerio';
import { html } from 'hono/html';
import type { Request } from 'patchright';

import type { Data, DataItem } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';
import { parseDateStrict } from '@/utils/time';

const baseUrl = 'https://www.last.fm';
const resourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);
const staticOrigins = new Set([baseUrl, 'https://cdn.jsdelivr.net']);
const timeZoneError = 'Last.fm did not provide a valid display time zone. Configure LASTFM_API_KEY to use the official API.';
// four steps may wait 30 seconds each
const browserCloseTimeout = 130000;

function isPublicRequestAllowed(request: Request, pagePath: string) {
    const url = new URL(request.url());
    const resourceType = request.resourceType();
    if (!resourceTypes.has(resourceType)) {
        return false;
    }
    if (resourceType === 'script') {
        return staticOrigins.has(url.origin);
    }
    if (url.origin !== baseUrl) {
        return false;
    }
    if (resourceType === 'document') {
        return url.pathname.toLowerCase() === pagePath.toLowerCase() && !url.search;
    }
    return url.pathname === '/timezone' || url.pathname === '/fastly/logo' || url.pathname.startsWith('/_fs-ch-') || url.pathname.startsWith('/static/animations/');
}

function parsePublicDate(value: string, timeZone: string) {
    const wallTime = parseDateStrict(value, 'dddd D MMM YYYY, h:mma')?.toZonedDateTimeISO('UTC').toPlainDateTime();
    if (!wallTime || wallTime.toLocaleString('en-US', { weekday: 'long' }) !== value.split(' ', 1)[0]) {
        throw new Error('Last.fm returned an unrecognised track timestamp. Configure LASTFM_API_KEY to use the official API.');
    }
    return wallTime.toZonedDateTime(timeZone).toInstant();
}

function addRecentGuids(items: DataItem[]) {
    const occurrences = new Map<string, number>();
    // Count from the oldest row so a new play in the same minute keeps existing IDs.
    for (const item of items.toReversed()) {
        const timestamp = item.pubDate instanceof Temporal.Instant ? item.pubDate.epochMilliseconds : 'nowplaying';
        const key = `${item.link}#scrobble-${timestamp}`;
        const occurrence = (occurrences.get(key) ?? 0) + 1;
        occurrences.set(key, occurrence);
        item.guid = `${key}-${occurrence}`;
    }
    return items;
}

export async function getPublicTracks(user: string, type: 'recent' | 'loved'): Promise<Data> {
    const pagePath = `/user/${encodeURIComponent(user)}/${type === 'recent' ? 'library' : 'loved'}`;
    const link = `${baseUrl}${pagePath}`;
    const { page, destroy } = await getPlaywrightPage(link, { noGoto: true, closeTimeout: browserCloseTimeout });
    try {
        await page.route('**/*', (request) => (isPublicRequestAllowed(request.request(), pagePath) ? request.continue() : request.abort()));
        const response = await page.goto(link, { waitUntil: 'domcontentloaded' });
        if (response?.status() === 404) {
            throw new Error(`Last.fm public page returned HTTP ${response.status()}. Try again later or configure LASTFM_API_KEY.`);
        }
        try {
            await page.waitForSelector('h1.header-title', { state: 'attached' });
        } catch {
            throw new Error(`Last.fm public page did not load (initial HTTP status: ${response?.status() ?? 'unknown'}). Try again later or configure LASTFM_API_KEY.`);
        }
        try {
            await page.locator('.footer-timezone').scrollIntoViewIfNeeded();
            await page.waitForSelector('.footer-timezone strong', { state: 'attached' });
        } catch {
            throw new Error(timeZoneError);
        }

        const content = await page.content();
        const $ = load(content);
        const timeZone = $('.footer-timezone strong').text();

        const items = $('.chartlist-row')
            .toArray()
            .map((element): DataItem => {
                const row = $(element);
                const track = row.find('.chartlist-name a');
                const title = track.attr('title') || track.text();
                const author = row.find('.chartlist-artist a').text();
                const timestamp = row.find('.chartlist-timestamp [title]').attr('title');
                const image = row.find('.chartlist-image img').attr('src');
                return {
                    title: `${title} - ${author}`,
                    author,
                    description: html`<img src="${image}" />`.toString(),
                    pubDate: timestamp ? parsePublicDate(timestamp, timeZone) : undefined,
                    link: `${baseUrl}${track.attr('href')}`,
                };
            });

        return {
            title: `${type === 'recent' ? 'Recent' : 'Loved'} Tracks by ${$('h1.header-title a').text()} - Last.fm`,
            link,
            item: type === 'recent' ? addRecentGuids(items) : items,
        };
    } finally {
        await destroy();
    }
}
