// MITRE - All Publications

// const got = require('@/utils/got');
// const cheerio = require('cheerio');
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `https://www.mitre.org/publications/all`;
    const host = `https://www.mitre.org`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        params: {
            title: 'MITRE: All Publications',
            host,
            link,
        },
        item: {
            item: 'div.list-item',
            title: `$('div.list-item div.list-main a span.title').text()`,
            link: `'%host%' + $('div.list-item div.list-main a').attr('href')`,
            category: `$('div.list-item div.list-main a span.time').text()`,
            description: `$('div.list-item div.list-main a span.teaser').html()`,
        },
    });
};
