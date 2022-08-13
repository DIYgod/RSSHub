const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://polkadot.network/blog/',
    });

    const $ = cheerio.load(response.data);
    const list = $('.container .row .card > div > a:nth-child(2)')
    
    ctx.state.data = {
        title: 'Polkadot-blog',
        link: 'https://polkadot.network/blog/',
        item: list.map((index, item) => ({
            title: $(item).find('h5').text.trim(),
            description: 'Polkadot',
            pubDate: new Date().toUTCString(),
            author: 'polkadot',
            link: item.href,
        })),
    };
};
