import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

const domain = 'whu.edu.cn';

/**
 * Process the meta information from the HTML content.
 *
 * @param {string} text - The HTML content.
 * @returns {Object} The meta information extracted from the content.
 */
const processMeta = (text) => {
    const meta = {};

    text.replaceAll(/<meta name="(.*?)" content="(.*?)"/gi, (_, key, value) => {
        meta[key] = value;
    });

    return meta;
};

/**
 * Get a specific meta value from the meta object.
 *
 * @param {Object} metaObject - The meta object.
 * @param {string} key        - The key of the meta value to retrieve.
 * @returns {string|undefined} The value of the specified meta key, or undefined if not found.
 */
const getMeta = (metaObject, key) => (Object.hasOwn(metaObject, key) ? metaObject[key] : undefined);

/**
 * Retrieves item details from a given link and updates the item object.
 * @param {Object} item    - The item object to be updated.
 * @param {string} rootUrl - The root URL of the item's link.
 * @returns {Promise<object>} The updated item object.
 */
const getItemDetail = async (item, rootUrl) => {
    try {
        const { data: detailResponse } = await got(item.link);

        const content = load(detailResponse);

        // Missing the `src` properties for the images.
        // The `src` property should be replaced with the value of `orisrc` to show the image.
        // Replace images in the content with custom JSX template.
        content('p.vsbcontent_img').each(function () {
            const image = content(this).find('img');
            content(this).replaceWith(
                renderDescription({
                    image: {
                        src: new URL(image.prop('orisrc'), rootUrl).href,
                        width: image.prop('width'),
                    },
                })
            );
        });

        // Missing the `src` properties for the videos.
        // The `src` property should be replaced with the value of `vurl` to play the video.
        // Replace videos in the content with custom JSX template.
        content('script[name="_videourl"]').each(function () {
            const video = content(this);
            video.replaceWith(
                renderDescription({
                    video: {
                        src: new URL(video.prop('vurl').split('?')[0], rootUrl).href,
                        width: content(video).prop('vwidth'),
                        height: content(video).prop('vheight'),
                    },
                })
            );
        });

        // Extract the description from the content.
        const description = content('div.v_news_content').html();

        // Remove unwanted table elements from the content.
        content('form[name="_newscontent_fromname"] table').remove();

        // Extract attachments from the content.
        const attachments = content('form[name="_newscontent_fromname"] ul li')
            .toArray()
            .map((attachment) => {
                attachment = content(attachment).find('a');

                return {
                    title: attachment.text(),
                    link: new URL(attachment.prop('href'), rootUrl).href,
                };
            });

        // Process the meta information from the detail response.
        const meta = processMeta(detailResponse);

        item.title = getMeta(meta, 'ArticleTitle') ?? item.title;
        item.description = renderDescription({
            description,
            attachments,
        });
        item.author = getMeta(meta, 'ContentSource');
        item.category = getMeta(meta, 'Keywords')?.split(' ').filter(Boolean) ?? [];
        item.guid = getMeta(meta, 'Url') ?? item.link;
        item.pubDate = getMeta(meta, 'PubDate') ? timezone(parseDate(getMeta(meta, 'PubDate')), +8) : item.pubDate;

        // Set enclosure information if attachments exist.
        if (attachments.length > 0) {
            item.enclosure_url = attachments[0].link;
            item.enclosure_type = `application/${attachments[0].title.split('.').pop()}`;
        }
    } catch {
        //
    }

    return item;
};

/**
 * Process items asynchronously.
 *
 * @param {Array<Object>} items - The array of items to process.
 * @param {Function} tryGet     - The function to attempt to get the content of a URL.
 * @param {string} rootUrl      - The root URL.
 * @returns {Array<Promise<Object>>} An array of promises that resolve to the processed items.
 */
const processItems = async (items, tryGet, rootUrl) =>
    await Promise.all(
        items.map((item) => {
            if (!item.link.includes(domain)) {
                return item;
            }

            return tryGet(item.link, async () => await getItemDetail(item, rootUrl));
        })
    );

export { domain, getMeta, processItems, processMeta };
