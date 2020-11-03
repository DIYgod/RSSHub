const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = ctx.params.url || 'video';
    const link = `https://www.pornhub.com/${url}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#videoCategory .videoBox');

    ctx.state.data = {
        title: $('title').first().text(),
        link: link,
        item:
            list &&
            list
                .map((_, e) => {
                    e = $(e);

                    return {
                        title: e.find('span.title a').text(),
                        link: `https://www.pornhub.com` + e.find('span.title a').attr('href'),
                        description: `<img src=${e.find('img').attr('data-thumb_url')}>`,
                    };
                })
                .get(),
    };
};
