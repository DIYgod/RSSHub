// const got = require('@/utils/got');
// const cheerio = require('cheerio');
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `https://www.sans.org/cyber-security-summit/archives/`;
    const host = `https://www.sans.org`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: 'SANS Institute: Summit Archives',
            host,
            link,
        },
        item: {
            item: 'li.bottom-buffer',
            title: `$('li.bottom-buffer strong').text()`,
            link: `'%link%'`,
            description: `$('li.bottom-buffer ul').html()`,
        },
    });
};
