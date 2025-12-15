import path from 'node:path';

import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';
import { art } from '@/utils/render';

const host = 'https://dribbble.com';

// Refactored function to load a link asynchronously
async function loadContent(link) {
    // Make a GET request to the specified  and retrieve the response
    const response = await ofetch(link);
    const $ = load(response);

    // Try to extract shotData from script, fallback to extracting from HTML if not found
    let shotData = JSON.parse(
        $('script')
            .text()
            .match(/shotData:\s({.+?}),\n/)?.[1] ?? '{}'
    );

    // If shotData is not available, extract data directly from HTML
    if (!shotData || Object.keys(shotData).length === 0) {
        // Extract data directly from HTML elements
        const title = $('.shot-title').first().text().trim();
        const authorElem = $('.shot-byline-user').first();
        const authorName = authorElem.find('span').first().text().trim();
        const postedOn = $('.shot-date').first().attr('datetime') || '';

        // Extract likes and saves count if available
        const likesCount = $('.shot-stats-container .like-button').first().text().trim();
        const savesCount = $('.shot-stats-container .save-button').first().text().trim();

        shotData = {
            title,
            shotUser: {
                name: authorName,
                team: {
                    name: '',
                    length: 0,
                },
            },
            postedOn,
            tags: [],
            likesCount: likesCount ? Number.parseInt(likesCount.replaceAll(/[^\d]/g, ''), 10) : 0,
            savesCount: savesCount ? Number.parseInt(savesCount.replaceAll(/[^\d]/g, ''), 10) : 0,
        };
    }

    // Join multiple shots together by selecting elements with class 'media-shot' or 'main-shot' or 'block-media-wrapper'
    // 'block-media-wrapper' is a new class of dribbble
    const shotMedia = $('.media-shot, .main-shot, .block-media-wrapper')
        .toArray()
        .map((element) => {
            const object = $(element);

            // remove the content that we don't want to show
            object.find('span.cropped-indicator, button').remove();

            object.find('video').each((_, videoElement) => {
                const video = $(videoElement);

                if (!video.attr('src') && video.data('src')) {
                    video.attr('src', video.data('src') as string);
                    video.removeAttr('data-src');
                    video.removeAttr('data-video-small');
                    video.removeAttr('data-video-medium');
                    video.removeAttr('data-video-large');
                }
            });
            object.find('img').each((_, imgElement) => {
                const img = $(imgElement);

                if (img.data('animated-url')) {
                    img.attr('src', img.data('animated-url') as string);
                    img.removeAttr('data-animated-url');
                    img.removeAttr('srcset');
                }

                if (!img.attr('src') && img.data('src')) {
                    img.attr('src', (img.data('src') as string).split('?')[0]);
                    img.removeAttr('data-src');
                }

                const src = img.attr('src');
                if (src) {
                    img.attr('src', src.split('?')[0]);
                }
                img.removeAttr('srcset');
                img.removeAttr('data-srcset');
            });
            object.find('a').each((_, aElement) => {
                const a = $(aElement);
                a.removeAttr('data-pswp-srcset');
            });

            return object.html();
        })
        .join('');

    const shotDescription = $('.shot-description-container');

    // Safely construct author string
    const authorName = shotData.shotUser?.name || '';
    const teamName = shotData.shotUser?.team?.name || '';
    const author = teamName ? `${authorName} for ${teamName}` : authorName;

    const description = art(path.join(__dirname, 'templates/description.art'), {
        shotMedia,
        shotData,
        description: shotDescription,
    });

    // Get the text content of the element with class 'shot-date' and convert it to a UTC string representation of a date
    const pubDate = shotData.postedOn ? parseDate(shotData.postedOn) : new Date();

    // Return an object containing the description and pubDate
    return {
        description,
        pubDate,
        author,
        category: shotData.tags || [],
    };
}

// Refactored code with comments for clarity

function ProcessFeed(list: AnyNode[]) {
    // Use Promise.all to process all items in the list asynchronously
    return Promise.all(
        list.map((item) => {
            const $ = load(item);

            // The link of item is "/signup/new" when access "https://dribbble.com/search/something"
            // So get url by id
            const itemId = $(item).data('thumbnail-id');

            // Construct the full item URL using the host and the item ID
            const guid = new URL(`/shots/${itemId}`, host).href;
            const itemUrl = new URL($(item).find('.shot-thumbnail-link').attr('href')!, host).href;

            // Extract thumbnail image from the list item
            // Since Dribbble uses lazy loading, we'll need to get the data-src attribute
            const thumbnailImg = $(item).find('.shot-thumbnail img');
            let thumbnailSrc = thumbnailImg.attr('src') || '';

            // If src is a placeholder, try to get the actual image URL from data attributes
            if (thumbnailSrc.includes('data:image/gif') || !thumbnailSrc) {
                const dataSrc = thumbnailImg.data('src');
                thumbnailSrc = (typeof dataSrc === 'string' ? dataSrc : thumbnailImg.attr('data-src')) || '';
            }

            // If still no image, try other common data attributes
            if (!thumbnailSrc) {
                const animatedUrl = thumbnailImg.data('animated-url');
                thumbnailSrc = typeof animatedUrl === 'string' ? animatedUrl : '';
            }

            // Create a basic description with the thumbnail if available
            let basicDescription = '';
            if (thumbnailSrc) {
                basicDescription = `<img src="${thumbnailSrc}" alt="Design thumbnail" /><br/>`;
            }

            // Return a Promise that resolves to an object combining the single item data and the additional data
            return cache.tryGet(guid, async () => {
                const { description, pubDate, author, category } = await loadContent(itemUrl);

                // Combine the thumbnail with the detailed description
                const fullDescription = basicDescription + (description || '');

                return {
                    title: $('.shot-title').text(),
                    link: itemUrl,
                    guid,
                    description: fullDescription,
                    pubDate,
                    author,
                    category,
                };
            });
        })
    );
}

/**
 * Retrieves data from a given URL and processes it.
 *
 * @param {string} url - The URL to retrieve data from.
 * @param {string} title - The title of the data.
 * @return {Object} - An object containing the retrieved data and metadata.
 */
const getData = async (url: string, title: string) => {
    // Use Puppeteer to get the page content
    const { page, destory } = await getPuppeteerPage(url, {
        gotoConfig: { waitUntil: 'networkidle2' },
    });

    try {
        // Wait a bit for dynamic content to load
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Get the page content
        const response = await page.content();

        // Load the response data into a cheerio object
        const $ = load(response);

        // Try new selectors based on current Dribbble structure
        let list: AnyNode[] = $('li[id^="screenshot-"]').toArray();

        // Fallback selectors
        if (list.length === 0) {
            list = $('[data-shot-id]').toArray();
        }

        if (list.length === 0) {
            list = $('.shot-thumbnail').closest('li, div').toArray() as unknown as AnyNode[];
        }

        if (list.length === 0) {
            list = $('.shot').toArray();
        }

        if (list.length === 0) {
            await destory();
            return {
                title,
                link: url,
                description: 'No items found',
                item: [],
            };
        }

        // Process the list items using the ProcessFeed function
        const result = await ProcessFeed(list);

        // Close the browser
        await destory();

        // Return an object containing the retrieved data and metadata
        return {
            title,
            link: url,
            description: $('meta[name="description"]').attr('content'),
            item: result,
        };
    } catch (error) {
        // Close the browser in case of error
        await destory();
        throw error;
    }
};

export default { getData };
