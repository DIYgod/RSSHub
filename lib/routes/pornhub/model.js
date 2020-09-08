const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const sort = ctx.params.sort ? ctx.params.sort : 'mr';
    const link = `https://www.pornhub.com/model/${username}/videos?o=${sort}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#mostRecentVideosSection .videoBox');

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
                        description: `<img src="${e.find('img').attr('data-thumb_url')}">`,
                    };
                })
                .get(),
    };
};
