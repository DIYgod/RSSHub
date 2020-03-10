const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://chrome.google.com/webstore/detail/${id}?hl=en`,
    });
    const data = cheerio
        .load(response.data)('noscript')
        .text();
    const $ = cheerio.load(data);

    const version = 'v' + $('.h-C-b-p-D-md').text();

    ctx.state.data = {
        title: $('.e-f-w').text() + ' 扩展程序更新 - Chrome',
        link: `https://chrome.google.com/webstore/detail/${id}`,
        item: [
            {
                title: version,
                description: $('.C-b-p-D-J').html(),
                link: `https://chrome.google.com/webstore/detail/${id}`,
                pubDate: new Date($('.h-C-b-p-D-xh-hh').text()).toUTCString(),
                guid: version,
                author: $('.C-b-p-rc-D-R').text(),
            },
        ],
    };
};
