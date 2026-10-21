import { load } from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { html } from 'hono/html';
import type { Request } from 'patchright';

import type { Data, DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const baseUrl = 'https://www.last.fm';
const resourceTypes = new Set(['document', 'script', 'stylesheet', 'xhr', 'fetch']);
const staticOrigins = new Set([baseUrl, 'https://cdn.jsdelivr.net', 'https://www.googletagmanager.com', 'https://cdn.snigelweb.com', 'https://a.pub.network', 'https://fonts.googleapis.com']);
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const timeZoneError = 'Last.fm did not provide a valid display time zone. Configure LASTFM_API_KEY to use the official API.';

function isPublicRequestAllowed(request: Request, pagePath: string) {
    const url = new URL(request.url());
    const resourceType = request.resourceType();
    if (!resourceTypes.has(resourceType)) {
        return false;
    }
    if (resourceType === 'script' || resourceType === 'stylesheet') {
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
    const parts = /^[a-z]+ (\d{1,2}) ([a-z]{3}) (\d{4}), (\d{1,2}):(\d{2})(am|pm)$/i.exec(value);
    if (!parts) {
        throw new Error('Last.fm returned an unrecognised track timestamp. Configure LASTFM_API_KEY to use the official API.');
    }
    const [, day, month, year, hour, minute, period] = parts;
    const hour24 = (Number(hour) % 12) + (period === 'pm' ? 12 : 0);
    const numericTime = `${year}-${String(monthNames.indexOf(month) + 1).padStart(2, '0')}-${day.padStart(2, '0')} ${String(hour24).padStart(2, '0')}:${minute}`;
    const wallTime = dayjs.utc(numericTime, 'YYYY-MM-DD HH:mm', true);
    if (Number(hour) < 1 || Number(hour) > 12 || !wallTime.isValid() || wallTime.locale('en').format('dddd D MMM YYYY, h:mma') !== value) {
        throw new Error('Last.fm returned an unrecognised track timestamp. Configure LASTFM_API_KEY to use the official API.');
    }
    const date = dayjs.tz(wallTime.format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm', timeZone);
    if (date.format('YYYY-MM-DD HH:mm') !== wallTime.format('YYYY-MM-DD HH:mm')) {
        throw new Error('Last.fm returned an invalid local track timestamp. Configure LASTFM_API_KEY to use the official API.');
    }
    return parseDate(date.toISOString());
}

function addRecentGuids(items: DataItem[]) {
    const occurrences = new Map<string, number>();
    // Count from the oldest row so a new play in the same minute keeps existing IDs.
    for (const item of items.toReversed()) {
        const timestamp = item.pubDate instanceof Date ? item.pubDate.getTime() : 'nowplaying';
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
    const { page, destroy } = await getPlaywrightPage(link, { noGoto: true, closeTimeout: 0 });
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
        const timeZone = $('.footer-timezone strong').text().trim();
        try {
            if (!timeZone) {
                throw new Error('Missing time zone');
            }
            new Intl.DateTimeFormat('en', { timeZone }).resolvedOptions();
        } catch {
            throw new Error(timeZoneError);
        }

        const items = $('.chartlist-row')
            .toArray()
            .map((element): DataItem => {
                const row = $(element);
                const track = row.find('.chartlist-name a');
                const trackPath = track.attr('href');
                const title = track.attr('title') || track.text();
                const author = row.find('.chartlist-artist a').text().trim();
                const timestamp = row.find('.chartlist-timestamp [title]').attr('title');
                const nowPlaying = row.hasClass('chartlist-row--now-scrobbling');
                if (!trackPath || !title || !author || (!timestamp && !nowPlaying)) {
                    throw new Error('Last.fm returned an incomplete track row. Configure LASTFM_API_KEY to use the official API.');
                }
                const image = row.find('.chartlist-image img').attr('src');
                return {
                    title: `${title} - ${author}`,
                    author,
                    description: image ? html`<img src="${image}" />`.toString() : undefined,
                    pubDate: timestamp ? parsePublicDate(timestamp, timeZone) : undefined,
                    link: new URL(trackPath, baseUrl).href,
                };
            });

        return {
            title: `${type === 'recent' ? 'Recent' : 'Loved'} Tracks by ${$('h1.header-title a').text().trim()} - Last.fm`,
            link,
            item: type === 'recent' ? addRecentGuids(items) : items,
        };
    } finally {
        await destroy();
    }
}
