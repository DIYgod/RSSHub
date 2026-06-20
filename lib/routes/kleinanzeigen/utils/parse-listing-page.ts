import type { CheerioAPI } from 'cheerio';

import type { DataItem } from '@/types';

import { getProductPage } from './get-product-page';

/**
 * parse listing page to get product infos
 * @param $ CheerioAPI data
 * @returns
 */
export const parseListingPage = ($: CheerioAPI): Promise<DataItem[]> =>
    Promise.all(
        $('li.ad-listitem.fully-clickable-card')
            .not('.badge-topad')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const article = $item.find('article').first();
                return getProductPage(`https://www.kleinanzeigen.de${article.attr('data-href')}`);
            })
    );
