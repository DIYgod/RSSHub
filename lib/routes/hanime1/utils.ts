import type { CheerioAPI } from 'cheerio';

import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const baseUrl = 'https://hanime1.me';

/** The site serves the monthly preview list under this genre plus a `date` filter. */
export const previewsGenre = '新番預告';

export type ListingItem = {
    /** Release date shown on the card, e.g. `9月25日`; it carries no year. */
    dateText?: string;
    description?: string;
    guid?: string;
    link: string;
    pubDate?: Date;
    title: string;
};

/** Requests without a browser TLS fingerprint are rejected, so everything goes through Playwright. */
export const createListingPage = (url: string) =>
    getPlaywrightPage(url, {
        closeTimeout: 0,
        noGoto: true,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });

export const fetchListing = async (url: string, page: Awaited<ReturnType<typeof createListingPage>>['page']) => {
    const response = await page.goto(url, { timeout: config.requestTimeout || 30000, waitUntil: 'domcontentloaded' });
    return {
        html: await page.content(),
        status: response ? response.status() : 0,
    };
};

export const fetchSearchListing = async (url: string) => {
    const { page, destroy } = await createListingPage(url);
    try {
        return await fetchListing(url, page);
    } finally {
        await destroy();
    }
};

/** Horizontal card: `.video-item-container` (carrying `title="[uploader] title"`) > `a.video-link` > `.title`. */
const parseHorizontalCards = ($: CheerioAPI): ListingItem[] => {
    const items: ListingItem[] = [];

    $('.video-item-container').each((_, element) => {
        const card = $(element);
        const anchor = card.find('a[href*="/watch?v="]').first();
        const link = anchor.attr('href');
        const title = anchor.find('.title').first().text().trim() || (card.attr('title') || '').replace(/^\[[^\]]*\]\s*/, '').trim();
        const image = anchor.find('img.main-thumb').first().attr('src') || anchor.find('img').first().attr('src');
        if (title && link) {
            items.push({ description: image ? `<img src="${image}">` : undefined, link, title });
        }
    });

    return items;
};

/** Grid card: an anchor wrapping a `home-rows-videos-div search-videos` block. */
const parseGridCards = ($: CheerioAPI): ListingItem[] => {
    const items: ListingItem[] = [];

    $('a[href*="/watch?v="]').each((_, element) => {
        const anchor = $(element);
        const link = anchor.attr('href');
        const title = anchor.find('.home-rows-videos-title').first().text().trim();
        const image = anchor.find('img').first().attr('src');
        if (title && link) {
            items.push({
                dateText: anchor.find('.video-card-inner > .hidden-xs').first().text().trim(),
                description: image ? `<img src="${image}">` : undefined,
                link,
                title,
            });
        }
    });

    return items;
};

/** Last resort for a template we do not know yet: any watch link, title from the closest `title` attribute. */
const parseUnknownCards = ($: CheerioAPI): ListingItem[] => {
    const items: ListingItem[] = [];

    $('a[href*="/watch?v="]').each((_, element) => {
        const anchor = $(element);
        const link = anchor.attr('href');
        const title = (anchor.find('[class*="title"]').first().text() || anchor.attr('title') || anchor.closest('[title]').attr('title') || '').replace(/^\[[^\]]*\]\s*/, '').trim();
        const image = anchor.find('img').first().attr('src');
        if (title && link) {
            items.push({ description: image ? `<img src="${image}">` : undefined, link, title });
        }
    });

    return items;
};

const dedupe = (items: ListingItem[]): ListingItem[] => {
    const seen = new Set<string>();
    const unique: ListingItem[] = [];
    for (const item of items) {
        if (seen.has(item.link)) {
            continue;
        }

        seen.add(item.link);
        unique.push(item);
    }

    return unique;
};

/**
 * Search card templates differ per page and do not follow the request parameters, so detect the template
 * from the DOM instead of a genre whitelist, and fall back to a generic reader for unknown templates.
 */
export const parseSearchListing = ($: CheerioAPI): ListingItem[] => {
    const hasHorizontal = $('.video-item-container').length > 0;
    const hasGrid = $('a[href*="/watch?v="] .home-rows-videos-div').length > 0;

    const items = dedupe([...(hasHorizontal ? parseHorizontalCards($) : []), ...(hasGrid ? parseGridCards($) : [])]);
    // A known template was detected, so an empty list means the site really has no result: do not fall back.
    return items.length > 0 || hasHorizontal || hasGrid ? items : dedupe(parseUnknownCards($));
};

/** Legacy preview page card, still served for older months. */
export const parsePreviewsListing = ($: CheerioAPI): ListingItem[] => {
    const items: ListingItem[] = [];

    $('.content-padding .row').each((_, element) => {
        const row = $(element);
        const title = row.find('.preview-info-content h4').first().text().trim();
        if (!title) {
            return;
        }

        const image = row.find('.preview-info-cover img').attr('src');
        const modalSelector = row.find('.trailer-modal-trigger').attr('data-target') || '';
        const video = modalSelector ? $(`${modalSelector} video source`).attr('src') || '' : '';
        const description = video ? `<video controls width="100%" poster="${image || ''}"><source src="${video}" type="video/mp4"></video>` : image ? `<img src="${image}">` : '';

        items.push({
            description,
            link: video || `${baseUrl}${row.find('.preview-info-cover a').attr('href') || ''}`,
            guid: `hanime1-${row.find('.preview-info-cover div').text().trim()}-${title}`,
            title,
        });
    });

    return items;
};

/** Cards only carry `M月D日`; a year is filled in only when it can be derived from the request. */
export const resolvePubDate = (dateText: string | undefined, year?: number, month?: number) => {
    const matched = /^(\d{1,2})月(\d{1,2})日$/.exec(dateText || '');
    if (!matched || !year || !month) {
        return;
    }

    const cardMonth = Number(matched[1]);
    const day = Number(matched[2]);
    let resolvedYear = year;
    if (month === 12 && cardMonth === 1) {
        resolvedYear = year + 1;
    } else if (cardMonth !== month) {
        return;
    }

    return timezone(parseDate(`${resolvedYear}-${cardMonth}-${day}`, 'YYYY-M-D'), 8);
};
