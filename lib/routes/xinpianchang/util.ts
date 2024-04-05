import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const appKey = '61a2f329348b3bf77';

const domain = 'xinpianchang.com';
const rootUrl = `https://www.${domain}`;
const rootApiUrl = `https://mod-api.${domain}`;

/**
 * Retrieves information from a given URL using a provided tryGet function.
 *
 * @param {string} url - The URL to fetch information from.
 * @param {Function} tryGet - The tryGet function that handles the retrieval process.
 * @returns {Promise<Object>} - A Promise that resolves to an object containing the retrieved information.
 */
const getData = (url, tryGet) =>
    tryGet(url, async () => {
        const { data: response } = await got(url);

        const $ = load(response);

        const icon = new URL('favicon.ico', rootUrl).href;
        const author = $('meta[property="og:site_name"]').prop('content');

        return {
            data: {
                title: $('span.bg-clip-text').text() || `${author}·${$('meta[property="og:title"]').prop('content').split('-')[0]}`,
                link: url,
                description: $('meta[property="og:description"]').prop('content'),
                language: $('html').prop('lang'),
                image: $('meta[property="og:image"]').prop('content'),
                icon,
                logo: icon,
                subtitle: $('meta[property="og:description"]').prop('content'),
                author,
                itunes_author: author,
                itunes_category: 'TV &amp Film',
                allowEmpty: true,
            },
            response,
        };
    });

/**
 * Process items asynchronously.
 *
 * @param {Array<Object>} items - The array of items to process.
 * @param {function} tryGet - The tryGet function that handles the retrieval process.
 * @returns {Promise<Array<Object>>} Returns a Promise that resolves to an array of processed items.
 */
const processItems = async (items, tryGet) => {
    items = items.map((item) => ({
        title: item.title,
        link: item.web_url,
        description: item.content,
        author: item.author.userinfo.username,
        category: item.categories.flatMap((c) => [c.category_name, c.sub?.category_name]).filter(Boolean),
        guid: `xinpianchang-${item.id}`,
        pubDate: parseDate(item.publish_time * 1000),
        itunes_item_image: item.cover,
        itunes_duration: item.duration,
        enclosure_url: item.video_library_id,
        upvotes: item.count.count_liked ?? item.count.count_like,
        comments: item.count.count_comment ?? 0,
    }));

    return await Promise.all(
        items.map((item) =>
            tryGet(item.guid, async () => {
                const apiUrl = new URL(`mod/api/v2/media/${item.enclosure_url}?appKey=${appKey}`, rootApiUrl).href;

                const { data: detailResponse } = await got(apiUrl);
                const data = detailResponse.data;

                const enclousure = data.resource?.progressive ? data.resource.progressive[0] : undefined;

                item.title = data.title ?? item.title;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    content: item.description,
                    cover: data.cover ?? item.itunes_item_image,
                    enclousure,
                });
                item.author = data.owner.username ?? item.author;

                item.category = [...new Set([...item.category, ...(data.categories ?? []), ...(data.keywords ?? [])])];
                item.itunes_item_image = data.cover ?? item.itunes_item_image;
                item.itunes_duration = data.duration ?? item.itunes_duration;

                if (enclousure) {
                    item.enclosure_url = enclousure.url ?? enclousure.backupUrl;
                    item.enclosure_length = enclousure.filesize;
                    item.enclosure_type = enclousure.mime;
                }

                return item;
            })
        )
    );
};

export { rootUrl, getData, processItems };
