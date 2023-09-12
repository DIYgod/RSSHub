const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const { join } = require('path');

// Refactored function to load a link asynchronously
async function load(link) {
    // Make a GET request to the specified  and retrieve the response
    const response = await got(link);
    const $ = cheerio.load(response.data);

    const shotData = JSON.parse(
        $('script')
            .text()
            .match(/shotData:\s(\{.+?\}),\n/)[1]
    );

    // Join multiple shots together by selecting elements with class 'media-shot' or 'main-shot' or 'block-media-wrapper'
    // 'block-media-wrapper' is a new class of dribbble
    const shotMedia = $('.media-shot, .main-shot, .block-media-wrapper')
        .toArray()
        .map((element) => {
            const object = $(element);

            // remove the content that we don't want to show
            object.find('span.cropped-indicator, button').remove();

            object.find('video').each((_, video) => {
                video = $(video);

                if (!video.attr('src') && video.data('src')) {
                    video.attr('src', video.data('src'));
                    video.removeAttr('data-src');
                    video.removeAttr('data-video-small');
                    video.removeAttr('data-video-medium');
                    video.removeAttr('data-video-large');
                }
            });
            object.find('img').each((_, img) => {
                img = $(img);

                if (img.data('animated-url')) {
                    img.attr('src', img.data('animated-url'));
                    img.removeAttr('data-animated-url');
                    img.removeAttr('srcset');
                }

                if (!img.attr('src') && img.data('src')) {
                    img.attr('src', img.data('src').split('?')[0]);
                    img.removeAttr('data-src');
                }

                img.attr('src', img.attr('src').split('?')[0]);
                img.removeAttr('srcset');
                img.removeAttr('data-srcset');
            });
            object.find('a').each((_, a) => {
                a = $(a);
                a.removeAttr('data-pswp-srcset');
            });

            return object.html();
        })
        .join('');

    const shotDescription = $('.shot-description-container');

    const author = `${shotData.shotUser.name}${shotData.shotUser.team.length ? ` for ${shotData.shotUser.team.name}` : ''}`;
    const description = art(join(__dirname, 'templates/description.art'), {
        shotMedia,
        shotData,
        description: shotDescription,
    });

    // Get the text content of the element with class 'shot-date' and convert it to a UTC string representation of a date
    const pubDate = parseDate(shotData.postedOn);

    // Return an object containing the description and pubDate
    return {
        description,
        pubDate,
        author,
        category: shotData.tags,
    };
}

// Refactored code with comments for clarity

function ProcessFeed(list, caches) {
    const host = 'https://dribbble.com';

    // Use Promise.all to process all items in the list asynchronously
    return Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);

            // The link of item is "/signup/new" when access "https://dribbble.com/search/something"
            // So get url by id
            const itemId = $(item).attr('id').replace('screenshot-', '');

            // Construct the full item URL using the host and the item ID
            const itemUrl = new URL(`/shots/${itemId}`, host).href;

            // Return a Promise that resolves to an object combining the single item data and the additional data
            return caches.tryGet(itemUrl, async () => {
                const { description, pubDate, author, category } = await load(itemUrl);

                return {
                    title: $('.shot-title').text(),
                    link: itemUrl,
                    description,
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
 * @param {Object} ctx - The context object.
 * @param {string} url - The URL to retrieve data from.
 * @param {string} title - The title of the data.
 * @return {Object} - An object containing the retrieved data and metadata.
 */
const getData = async (ctx, url, title) => {
    // Make a GET request to the specified URL
    const response = await got(url);

    // Extract the response data
    const data = response.data;

    // Load the response data into a cheerio object
    const $ = cheerio.load(data);
    // Get all the list items under the 'ol.dribbbles.group' element
    const list = $('ol.dribbbles.group > li').toArray();

    // Process the list items using the ProcessFeed function
    const result = await ProcessFeed(list, ctx.cache);

    // Return an object containing the retrieved data and metadata
    return {
        title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};

module.exports = {
    getData,
};
