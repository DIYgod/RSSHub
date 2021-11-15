import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        query,
        params
    } = ctx;
    const baseURL = 'https://www.gocomics.com';
    const {
        name
    } = params;
    const {
        limit = 5
    } = query;
    const url = `${baseURL}/${name}/`;

    const {
        data
    } = await got({
        method: 'get',
        url,
    });
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
                title,
                author,
                category: 'comic',
                description,
                pubDate,
                link,
                previous,
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
