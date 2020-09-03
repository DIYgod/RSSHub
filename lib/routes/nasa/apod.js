const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const date = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + -5 * 60 * 60 * 1000);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const rootUrl = `https://apod.nasa.gov/apod/ap${year.substr(2, 2) + month + day}.html`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: 'NASA Astronomy Picture of the Day',
        link: rootUrl,
        item: [
            {
                title: $('center b').eq(0).text() + ` | ${year}-${month}-${day}`,
                description: `<img src="${$('img').attr('src')}"><br>${$('body p').eq(2).html()}`,
                link: rootUrl,
                pubDate: new Date(`${year}-${month}-${day}`).toUTCString(),
            },
        ],
    };
};
