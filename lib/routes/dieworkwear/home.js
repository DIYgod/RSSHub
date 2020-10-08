/* eslint-disable linebreak-style */
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://dieworkwear.com/feed/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('a.understrap-read-more-link');

    ctx.state.data = {
        title: 'Die, Workwear!',
        link: 'https://dieworkwear.com/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const url = item[0].attribs.href;

                    const response = got({
                        method: 'get',
                        url: url,
                    });

                    const postData = response.data;

                    return {
                        title: item.find('h1.entry-title').first().text(),
                        description: item.find('.title a').first().text(),
                        link: item.find('.title a').attr('href'),
                    };
                })
                .get(),
    };
};