const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const byline = ctx.params.byline;

    const authorUrl = `https://www.nytimes.com/by/${byline}`;

    const response = await got({
        method: 'get',
        url: authorUrl,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const authorName = $('h1').text();

    const items = $('#stream-panel li')
        .map((index, elem) => {
            const $item = $(elem);
            const $info = $item.find('div > div');
            const title = $info.find('h3').text();
            const href = $info.find('a').attr('href');
            const link = new URL(href, authorUrl);
            const description = $info.find('a > p').text();
            const author = $info.find('a p > span').text();

            return {
                title,
                author,
                description,
                link,
            };
        })
        .get()
        .filter((d) => d.title);

    ctx.state.data = {
        title: `${authorName} - The New York Times`,
        link: authorUrl,
        item: items,
    };
};
