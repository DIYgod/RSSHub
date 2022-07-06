const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    // should be:
    // undefined
    // U3C3
    // Videos
    // Photo
    // Book
    // Game
    // Software
    // Other
    const rootURL = 'https://www.u3c3.com';
    let currentURL;
    let title;
    if (typeof type === 'undefined') {
        currentURL = rootURL;
        title = 'home - u3c3';
    } else if (type === 'search') {
        const keyword = typeof ctx.params.keyword === 'undefined' ? '' : ctx.params.keyword;
        currentURL = `${rootURL}/?search=${keyword}`;
        title = `search ${keyword} - u3c3`;
    } else {
        currentURL = `${rootURL}/?type=${type}&p=1`;
        title = `${type} - u3c3`;
    }

    const response = await got(currentURL);
    const $ = cheerio.load(response.data);

    const items = $('body > div.container > div.table-responsive > table > tbody > tr')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('td:nth-of-type(2) > a ').attr('title');
            const guid = rootURL + item.find('td:nth-of-type(2) > a').attr('href');
            const link = guid;
            const pubDate = item.find('td:nth-of-type(5)').text();
            const enclosure_url = item.find('td:nth-of-type(3) > a:nth-of-type(2)').attr('href');
            return {
                title,
                guid,
                link,
                pubDate,

                enclosure_url,
                enclosure_type: 'application/x-bittorrent',
            };
        });

    ctx.state.data = {
        title,
        description: title,
        link: currentURL,
        item: items,
    };
};
