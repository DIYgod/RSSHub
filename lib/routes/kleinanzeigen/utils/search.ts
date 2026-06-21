import { load } from 'cheerio';

import type { Data } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseListingPage } from './parse-listing-page';
import { resolveCategory } from './resolve-category';
import { resolveLocation } from './resolve-location';

/**
 * parse listing page to get product infos
 * @param $ CheerioAPI data
 * @returns
 */
export const search = async (opts: {
    query?: string;
    category?: string;
    categoryId?: number | string;
    location?: string;
    locationId?: number | string;
    radius?: number | string;
    sortingField?: 'SORTING_DATE' | 'PRICE_AMOUNT' | 'PRICE_AMOUNT_DESC' | string;
    // adType?: number;
    // posterType?: number;
    maxPrice?: number | string;
    minPrice?: number | string;
    buyNowEnabled?: boolean;
    shippingCarrier?: 'DHL' | 'HERMES' | string;
    // shipping?: number;
}): Promise<Data> => {
    const url = new URL('https://www.kleinanzeigen.de/s-suchanfrage.html');

    if (opts.categoryId) {
        url.searchParams.append('categoryId', opts.categoryId.toString());
    } else if (opts.category) {
        const locId = resolveCategory(opts.category);
        url.searchParams.append('categoryId', locId?.toString() || '');
    } else {
        url.searchParams.append('categoryId', '');
    }

    if (opts.locationId) {
        url.searchParams.append('locationId', opts.locationId.toString());
    } else if (opts.location) {
        const locId = await resolveLocation(opts.location);
        url.searchParams.append('locationId', locId?.toString() || '');
    } else {
        url.searchParams.append('locationId', '');
    }

    url.searchParams.append('keywords', opts.query || '');
    url.searchParams.append('locationStr', '');
    url.searchParams.append('radius', opts.radius?.toString() || '');
    url.searchParams.append('sortingField', opts.sortingField || 'SORTING_DATE');
    url.searchParams.append('adType', '');
    url.searchParams.append('posterType', '');
    url.searchParams.append('maxPrice', opts.maxPrice?.toString() || '');
    url.searchParams.append('minPrice', opts.minPrice?.toString() || '');
    url.searchParams.append('buyNowEnabled', opts.minPrice ? 'true' : 'false');
    url.searchParams.append('shippingCarrier', opts.shippingCarrier || '');
    url.searchParams.append('shipping', '');

    const response = await ofetch(url.href);
    const $ = load(response);

    const items = await parseListingPage($);

    return {
        // channel title
        title: `Kleinanzeigen Offers: ${opts.query || opts.category} ${opts.minPrice || opts.maxPrice ? `${opts.minPrice || 0}€ - ${opts.maxPrice}` : ''}`,
        // channel link
        link: url.href,
        language: 'de',
        // each feed item
        item: items,
    };
};
