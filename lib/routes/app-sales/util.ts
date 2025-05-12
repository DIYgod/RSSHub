import { type DataItem } from '@/types';

import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import path from 'node:path';

const baseUrl: string = 'https://app-sales.net';

/**
 * Formats price change information into a standardized tag
 * @param priceOld - Old price
 * @param priceNew - New price
 * @param priceDisco - Discount
 * @returns Formatted price change tag string. Returns empty string when no new price exists.
 */
const formatPriceChangeTag = (priceOld: string, priceNew: string, priceDisco: string): string => (priceNew?.trim() ? `[${[priceOld && `${priceOld}→`, priceNew, priceDisco && ` ${priceDisco}`].filter(Boolean).join('')}]` : '');

/**
 * Processes DOM elements into structured data items
 * @param $ - CheerioAPI instance
 * @param selector - CSS selector for target elements
 * @returns Parsed data items array.
 */
const processItems = ($: CheerioAPI, selector: string): DataItem[] =>
    $(selector)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const appName: string = $el.find('p.app-name').text()?.trim();
            const appDev: string = $el.find('p.app-dev').text()?.trim();
            const appNote: string = $el.find('p.app-dev').next('p')?.text()?.trim() ?? '';
            const rating: string = $el.find('p.rating').contents().last().text()?.trim();
            const downloads: string = $el.find('p.downloads').contents().last().text()?.trim();
            const bookmarks: string = $el.find('p.bookmarks').contents().last().text()?.trim();
            const priceNew: string = $el.find('div.price-new').text()?.trim();
            const priceOld: string = $el.find('div.price-old').text()?.trim();
            const priceDisco: string = $el.find('div.price-disco').text()?.trim();

            const isHot: boolean = $el.hasClass('sale-hot');
            const isFree: boolean = priceNew.toLocaleUpperCase() === 'FREE';

            const title: string = `${appName} ${formatPriceChangeTag(priceOld, priceNew, priceDisco)}`;
            const image: string | undefined = $el.find('div.app-icon img').attr('src');
            const linkUrl: string | undefined = $el.find('div.sale-list-action a').attr('href');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              alt: `${appName}-${appDev}`,
                              src: image,
                          },
                      ]
                    : undefined,
                appName,
                appDev,
                appNote,
                rating,
                downloads,
                bookmarks,
                priceNew,
                priceOld,
                priceDisco,
                linkUrl,
            });
            const categories: string[] = [isHot ? 'Hot' : undefined, isFree ? 'Free' : undefined].filter(Boolean) as string[];
            const authors: DataItem['author'] = appDev;
            const guid: string = [appName, appDev, rating, downloads, bookmarks, priceNew].filter(Boolean).join('-');

            const processedItem: DataItem = {
                title: title.trim(),
                description,
                link: linkUrl,
                category: categories,
                author: authors,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
            };

            return processedItem;
        });

/**
 * Retrieves pagination URLs from page navigation
 * @param $ - CheerioAPI instance
 * @param targetUrl - Base URL for relative path resolution
 * @returns Array of absolute pagination URLs.
 */
const getAvailablePageUrls = ($: CheerioAPI, targetUrl: string): string[] =>
    $('ul.pagination li.waves-effect a')
        .slice(0, -1)
        .toArray()
        .filter((el): Element => {
            const $el: Cheerio<Element> = $(el);

            return $el.attr('href');
        })
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            return new URL($el.attr('href') as string, targetUrl).href;
        });

/**
 * Aggregates items across paginated pages
 * @param $ - Initial page CheerioAPI instance
 * @param selector - Target element CSS selector
 * @param targetUrl - Base URL for pagination requests
 * @param country - Country ID for request headers
 * @param limit - Maximum number of items to return
 * @returns Aggregated items array within specified limit.
 */
const fetchItems = async ($: CheerioAPI, selector: string, targetUrl: string, country: string, limit: number): Promise<DataItem[]> => {
    const initialItems: DataItem[] = processItems($, selector);

    if (initialItems.length >= limit) {
        return initialItems.slice(0, limit);
    }

    const pagePromises = getAvailablePageUrls($, targetUrl).map(async (url: string): Promise<DataItem[]> => {
        try {
            const response = await ofetch(url, {
                headers: {
                    Cookie: `countryId=${country};`,
                },
            });
            return processItems(load(response), selector);
        } catch {
            return [];
        }
    });

    const items: DataItem[] = [];

    for await (const pageItems of pagePromises) {
        items.push(...pageItems);

        if (items.length + initialItems.length >= limit) {
            break;
        }
    }

    return [...initialItems, ...items].slice(0, limit);
};

export { baseUrl, fetchItems };
