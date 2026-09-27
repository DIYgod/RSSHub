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

/** Search page card: an anchor wrapping a `home-rows-videos-div search-videos` block. */
export const parseSearchListing = ($: CheerioAPI): ListingItem[] => {
    const seen = new Set<string>();
    const items: ListingItem[] = [];

    $('a[href*="/watch?v="]').each((_, element) => {
        const anchor = $(element);
        const title = anchor.find('.home-rows-videos-title').first().text().trim();
        const link = anchor.attr('href');
        if (!title || !link || seen.has(link)) {
            return;
        }
        seen.add(link);
        const image = anchor.find('img').first().attr('src');
        items.push({
            dateText: anchor.find('.video-card-inner > .hidden-xs').first().text().trim(),
            description: image ? `<img src="${image}">` : undefined,
            link,
            title,
        });
    });

    return items;
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
