const got = require('@/utils/got');
const cheerio = require('cheerio');

async function loadReview(existingDescription, path) {
    const url = `https://letterboxd.com/${path}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const review = $('div.review');

    // remove the content that we don't want to show
    review.find('.hidden').remove();
    review.find('.has-spoilers').remove();

    // generate the new description
    const reviewText = review.html();
    const newDescription = existingDescription + `<br />${reviewText}`;

    return {
        description: newDescription,
    };
}

function ProcessFeed(list, username, caches) {
    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = $('.td-film-details a').attr('href');

            const dateString = $('.td-day > a')
                .attr('href')
                .replace('/' + username + '/films/diary/for/', '')
                .replace(/\/$/, '');
            const pubDate = new Date(dateString).toUTCString();

            const displayDate = new Date(dateString).toDateString();

            const filmTitle = $('.td-film-details a').text();
            const rating = $('.td-rating .rating').text();
            const liked = $('.td-like > .has-icon').length > 0;
            const rewatch = $('.td-rewatch.icon-status-off').length <= 0;
            const hasReview = $('.td-review.icon-status-off').length <= 0;

            let descriptionText = `<b>${filmTitle}</b><br />watched by ${username}<br />Date: ${displayDate}<br />Rating: ${rating}`;

            if (liked) {
                descriptionText = descriptionText + '<br />Liked';
            }
            if (rewatch) {
                descriptionText = descriptionText + '<br />Rewatch';
            }

            const single = {
                title: filmTitle,
                link: itemUrl,
                author: username,
                guid: itemUrl,
                pubDate,
            };

            if (hasReview) {
                const description = await caches.tryGet(itemUrl, () => loadReview(descriptionText, itemUrl));

                return Object.assign({}, single, description);
            }

            const description = {
                description: descriptionText,
            };

            return Object.assign({}, single, description);
        })
    );
}

const getData = async (ctx, username, url, title) => {
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.diary-entry-row').get();

    const result = await ProcessFeed(list, username, ctx.cache);

    return {
        title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};

const getFollowingData = async (ctx, username, url, title) => {
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.person-table td.table-person').get();

    const users = list.map((user) => {
        const $ = cheerio.load(user);
        return $('a.name').attr('href');
    });

    const usersResult = await Promise.all(
        users.map((user) => {
            const userWithoutSlashes = user.replace(/^\//, '').replace(/\/$/, '');

            const url = `https://letterboxd.com/${userWithoutSlashes}/films/diary/by/added/`;
            return getData(ctx, userWithoutSlashes, url, title);
        })
    );

    const usersItems = usersResult.map((result) => result.item);
    const flattenedItems = usersItems.flat();

    return {
        title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: flattenedItems,
    };
};

module.exports = {
    getData,
    getFollowingData,
};
