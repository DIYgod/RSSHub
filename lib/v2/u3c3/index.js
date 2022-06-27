const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.u3c3.com';

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
    let link = host;
    let title = host;
    if (typeof type === 'undefined') {
        link = host;
        title = host;
    } else if (type === 'search') {
        const keyword = typeof ctx.params.keyword === 'undefined' ? '' : ctx.params.keyword;
        link = `${host}/?search=${keyword}`;
        title = `search ${keyword} - ${host}`;
    } else {
        link = `${host}/?type=${type}&p=1`;
        title = `${type} - ${host}`;
    }

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);

    const items = $('body > div.container > div.table-responsive > table > tbody > tr')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('td:nth-of-type(2) > a ').attr('title');
            const guid = host + item.find('td:nth-of-type(2) > a').attr('href');
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
        link,
        item: items,
    };
};
