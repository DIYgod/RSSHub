const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseURL = 'https://www.comicskingdom.com';
    const name = ctx.params.name;
    const url = `${baseURL}/${name}/archive`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    // Determine Comic and Author from main page
    const comic = $('title').text().replace('Comics Kingdom - ', '').trim();
    const author = $('div.author p').text();

    // Find the links for all non-archived items
    const links = $('div.archive-tile[data-is-blocked=false]')
        .map((i, el) => $(el).find('a[data-prem="Comic Tile"]').first().attr('href'))
        .get()
        .map((url) => `${baseURL}${url}`);

    if (links.length === 0) {
        throw `Comic Not Found - ${name}`;
    }
    const items = await Promise.all(
        links.map(
            async (link) =>
                await ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    const title = content('title').text();
                    const image = content('meta[property="og:image"]').attr('content');
                    const description = `<img src="${image}" />`;
                    // Pull the date out of the URL
                    const pubDate = new Date(link.split('/').slice(-3).join('/')).toUTCString();

                    return {
                        title: title,
                        author: author,
                        category: 'comic',
                        description: description,
                        pubDate: pubDate,
                        link: link,
                    };
                })
        )
    );

    ctx.state.data = {
        title: `${comic} - Comics Kingdom`,
        link: url,
        item: items,
    };
};
