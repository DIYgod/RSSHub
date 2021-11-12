const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const shotMedia = $('.media-shot,.main-shot') // join multiple shots together
        .toArray()
        .map((element) => {
            const object = $(element);

            // remove the content that we don't want to show
            object.find('span.cropped-indicator').remove();

            return object.html();
        })
        .join('');
    const shotDescription = $('.shot-desc').html() || '';

    const shotLikes = $('.shot-likes').text() || '0 likes';
    const shotSaves = $('.shot-saves').text() || '0 saves';

    const description = `${shotMedia}<br />
	                        ${shotDescription}<br />
	                        ${shotLikes}<br />
	                        ${shotSaves}`;

    const pubDateString = $('.shot-date').text();
    const pubDate = new Date(pubDateString).toUTCString();

    return {
        description,
        pubDate,
    };
}

function ProcessFeed(list, caches) {
    const host = 'https://dribbble.com';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            // The link of item is "/signup/new" when access "https://dribbble.com/search/something"
            // So get url by id
            const itemId = $(item).attr('id').replace('screenshot-', '');
            const itemUrl = url.resolve(host, `/shots/${itemId}`);

            const team = $('.attribution-team').text() ? ' for ' + $('.attribution-team a.url').text() : '';
            const author = 'by ' + $('.shot-byline-user a.url').text();

            const single = {
                title: $('.shot-title').text(),
                link: itemUrl,
                author: author + team,
                guid: itemUrl,
            };

            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
}

const getData = async (ctx, url, title) => {
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ol.dribbbles.group > li').get();

    const result = await ProcessFeed(list, ctx.cache);

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
