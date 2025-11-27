import path from 'node:path';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';

const baseUrl: string = 'https://www.app-sales.net';

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
        .map((el) => {
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
            const isFree: boolean = priceNew?.toLocaleUpperCase() === 'FREE';

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
        .filter((el) => {
            const $el: Cheerio<Element> = $(el);

            return $el.attr('href');
        })
        .map((el) => {
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
    const initialItems = processItems($, selector);
    if (initialItems.length >= limit) {
        return initialItems.slice(0, limit);
    }

    /**
     * Recursive helper function to process paginated URLs
     *
     * @param remainingUrls - Array of URLs yet to be processed
     * @param aggregated - Accumulator for collected items
     *
     * @returns Promise resolving to aggregated items
     */
    const processPage = async (remainingUrls: string[], aggregated: DataItem[]): Promise<DataItem[]> => {
        if (aggregated.length >= limit || remainingUrls.length === 0) {
            return aggregated.slice(0, limit);
        }

        const [currentUrl, ...restUrls] = remainingUrls;

        try {
            const response = await ofetch(currentUrl, {
                headers: {
                    Cookie: `countryId=${country};`,
                },
            });
            const pageItems = processItems(load(response), selector);
            const newItems = [...aggregated, ...pageItems];

            return newItems.length >= limit ? newItems.slice(0, limit) : processPage(restUrls, newItems);
        } catch {
            return processPage(restUrls, aggregated);
        }
    };

    return await processPage(getAvailablePageUrls($, targetUrl), initialItems);
};

export { baseUrl, fetchItems };
