const got = require('@/utils/got');
const cheerio = require('cheerio');
const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/update`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);
    $('img').each((_, ele) => {
        if (ele.attribs['data-original']) {
            ele.attribs.src = ele.attribs['data-original'];
            delete ele.attribs['data-original'];
        }
    });

    const list = $('.video_item')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('a').attr('href').replace('http://', 'https://');

            return {
                title: item.text(),
                link,
                description: item.html(),
                guid: `${link}#${item.find('.video_item--info').text()}`,
            };
        });
    const items = list;

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
