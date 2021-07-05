const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseURL = 'https://www.gocomics.com';
    const name = ctx.params.name;
    const limit = ctx.query.limit || 5;
    const url = `${baseURL}/${name}/`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    // Determine Comic and Author from main page
    const comic = $('.media-heading').eq(0).text();
    const author = $('.media-subheading').eq(0).text().replace('By ', '');

    // Load previous comic URL
    const items = [];
    let previous = $('.gc-deck--cta-0 a').attr('href');

    if (!previous) {
        throw `Comic Not Found - ${name}`;
    }

    while (items.length < limit) {
        const link = `${baseURL}${previous}`;
        /* eslint-disable no-await-in-loop */
        const item = await ctx.cache.tryGet(link, async () => {
            const detailResponse = await got({
                method: 'get',
                url: link,
            });
            const content = cheerio.load(detailResponse.data);

            const title = content('h1.m-0').eq(0).text();
            const image = content('.comic.container').eq(0).attr('data-image');
            const description = `<img src="${image}" />`;
            // Pull the date out of the URL
            const pubDate = new Date(link.split('/').slice(-3).join('/')).toUTCString();
            const previous = content('.js-previous-comic').eq(0).attr('href');

            return {
                title: title,
                author: author,
                category: 'comic',
                description: description,
                pubDate: pubDate,
                link: link,
                previous: previous,
            };
        });
        items.push(item);
        previous = item.previous;
    }
    ctx.state.data = {
        title: `${comic} - GoComics`,
        link: url,
        item: items,
    };
};
