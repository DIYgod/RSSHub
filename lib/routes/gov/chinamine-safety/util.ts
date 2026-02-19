import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.chinamine-safety.gov.cn';

/**
 * Process the item list and return the resulting array.
 *
 * @param {Object[]} items - The items to process.
 * @param {Function} tryGet - The tryGet function that handles the retrieval process.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of processed items.
 */
const processItems = async (items, tryGet) =>
    await Promise.all(
        items.map((item) =>
            tryGet(item.link, async () => {
                if (!item.link.endsWith('html')) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = item.title || content('title').text();
                item.description = content('div.TRS_Editor, div.TRS_UEDITOR, div.content').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = [
                    ...new Set(
                        [
                            ...(content('meta[name="keywords"]').prop('content')?.split(/,/) ?? []),
                            content('meta[name="ColumnName"]').prop('content'),
                            ...(content('meta[name="ColumnKeywords"]').prop('content')?.split(/,/) ?? []),
                            content('meta[name="ColumnType"]').prop('content'),
                        ].filter(Boolean)
                    ),
                ];
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

/**
 * Fetch data from the specified URL.
 *
 * @param {cheerio.CheerioAPI} $ - The cheerio.CheerioAPI.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 */
const fetchData = ($, currentUrl) => {
    const image = new URL('zfxxgk/images/P020210105557462473306.png', rootUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), currentUrl).href;

    return {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content') || $('meta[name="Description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
};

export { fetchData, processItems, rootUrl };
