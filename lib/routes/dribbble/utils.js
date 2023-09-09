const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// Refactored function to load a link asynchronously
async function load(link) {
    // Make a GET request to the specified  and retrieve the response
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // Join multiple shots together by selecting elements with class 'media-shot' or 'main-shot' or 'block-media-wrapper'
    // 'block-media-wrapper' is a new class of dribbble
    const shotMedia = $('.media-shot,.main-shot,.block-media-wrapper')
        .toArray()
        .map((element) => {
            const object = $(element);

            // remove the content that we don't want to show
            object.find('span.cropped-indicator').remove();

            return object.html();
        })
        .join('');

    const shotDescription = $('.shot-desc').html() || '';

    // They only show on modal and can't be catch now, so comment them out.
    // const shotLikes = $('.shot-likes').text() || '0 likes';
    // const shotSaves = $('.shot-saves').text() || '0 saves';

    const description = `${shotMedia}<br />${shotDescription}`;

    // Get the text content of the element with class 'shot-date' and convert it to a UTC string representation of a date
    const pubDateString = $('.shot-date').text();
    const pubDate = new Date(pubDateString).toUTCString();

    // Return an object containing the description and pubDate
    return {
        description,
        pubDate,
    };
}

// Refactored code with comments for clarity

function ProcessFeed(list, caches) {
    const host = 'https://dribbble.com';

    // Use Promise.all to process all items in the list asynchronously
    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            // The link of item is "/signup/new" when access "https://dribbble.com/search/something"
            // So get url by id
            const itemId = $(item).attr('id').replace('screenshot-', '');

            // Construct the full item URL using the host and the item ID
            const itemUrl = url.resolve(host, `/shots/${itemId}`);

            // Extract the team name from the '.attribution-team' element
            const team = $('.attribution-team').text() ? ' for ' + $('.attribution-team a.url').text() : '';

            // Extract the author name from the '.shot-byline-user' element
            const author = 'by ' + $('.shot-byline-user a.url').text();

            // Create an object representing the single item with its properties
            const single = {
                title: $('.shot-title').text(),
                link: itemUrl,
                author: author + team,
                guid: itemUrl,
            };

            // Try to get additional data from the caches using the item URL as the key
            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            // Return a Promise that resolves to an object combining the single item data and the additional data
            return Promise.resolve(Object.assign({}, single, other));
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
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    // Extract the response data
    const data = response.data;

    // Load the response data into a cheerio object
    const $ = cheerio.load(data);
    // Get all the list items under the 'ol.dribbbles.group' element
    const list = $('ol.dribbbles.group > li').get();

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
