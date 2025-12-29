import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';

const baseUrl: string = 'https://www.app-sales.net';
const renderDescription = ({
    images,
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
}: {
    images?: { alt?: string; src?: string }[];
    appName?: string;
    appDev?: string;
    appNote?: string;
    rating?: string;
    downloads?: string;
    bookmarks?: string;
    priceNew?: string;
    priceOld?: string;
    priceDisco?: string;
    linkUrl?: string;
}): string =>
    renderToString(
        <>
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ) : null
            )}
            {appName ? (
                <table>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <td>{appName}</td>
                        </tr>
                        {appDev ? (
                            <tr>
                                <th>Developer</th>
                                <td>{appDev}</td>
                            </tr>
                        ) : null}
                        {appNote ? (
                            <tr>
                                <th>Note</th>
                                <td>{appNote}</td>
                            </tr>
                        ) : null}
                        {rating ? (
                            <tr>
                                <th>Rating</th>
                                <td>{rating}</td>
                            </tr>
                        ) : null}
                        {downloads ? (
                            <tr>
                                <th>Downloads</th>
                                <td>{downloads}</td>
                            </tr>
                        ) : null}
                        {bookmarks ? (
                            <tr>
                                <th>Bookmarks</th>
                                <td>{bookmarks}</td>
                            </tr>
                        ) : null}
                        {priceNew ? (
                            <tr>
                                <th>Price</th>
                                <td>
                                    <span>
                                        <strong>{priceNew}</strong>
                                    </span>
                                    {priceOld ? (
                                        <span style="color: grey;">
                                            <small>
                                                <del>{priceOld}</del>
                                            </small>
                                        </span>
                                    ) : null}
                                    {priceDisco ? (
                                        <span style="color: white; background-color: #54ae45;">
                                            <strong>{priceDisco}</strong>
                                        </span>
                                    ) : null}
                                </td>
                            </tr>
                        ) : null}
                        {linkUrl ? (
                            <tr>
                                <th>Link</th>
                                <td>
                                    <a href={linkUrl} target="_blank">
                                        {linkUrl}
                                    </a>
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            ) : null}
        </>
    );

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
            const description: string | undefined = renderDescription({
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
