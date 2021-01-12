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
        item: list
            .map(async (index, item) => {
                item = $(item);
                const url = item[0].attribs.href;

                const response = await got({
                    method: 'get',
                    url: url,
                });

                const postData = response.data;

                const post$ = cheerio.load(postData);

                const single = {
                    title: post$('.entry-title').first().text(),
                    description: post$('.entry-content').first().text(),
                    link: url,
                };

                return single;
            })
            .get(),
    };
};
