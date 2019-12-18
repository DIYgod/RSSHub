const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const shotMedia = $('.media-shot').html() || $('.main-shot').html() || '';
    const shotDescription = $('.shot-desc').html() || '';

    const shotViews = $('.shot-views').text() || '0 views';
    const shotLikes = $('.shot-likes').text() || '0 likes';
    const shotSaves = $('.shot-saves').text() || '0 saves';

    const description = `${shotMedia}<br />
	                        ${shotDescription}<br />
	                        ${shotViews}<br />
	                        ${shotLikes}<br />
	                        ${shotSaves}`;

    const pubDateString = $('.shot-date').text();
    const pubDate = new Date(pubDateString).toUTCString();

    return {
        description,
        pubDate,
    };
}

async function ProcessFeed(list, caches) {
    const host = 'https://dribbble.com';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            // the rebounds link is used because all other links in the html could
            // possibly point to /signup/new when loading the site while not logged in.
            const itemUrlPath = $('.extras > a')
                .attr('href')
                .replace('/rebounds', '');
            const itemUrl = url.resolve(host, itemUrlPath);

            const team = $('.attribution-team').text() ? ' for ' + $('.attribution-team a.url').text() : '';
            const author = 'by ' + $('.attribution-user a.url').text();

            const single = {
                title: $('.dribbble-over strong').text(),
                link: itemUrl,
                author: author + team,
                guid: itemUrl,
            };

            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
}

const getData = async (ctx, url, title) => {
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ol.dribbbles.group li.group').get();

    const result = await ProcessFeed(list, ctx.cache);

    return {
        title: title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};

module.exports = {
    getData,
};
