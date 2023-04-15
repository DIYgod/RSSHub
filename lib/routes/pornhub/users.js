const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const language = ctx.params.language || 'www';
    const username = ctx.params.username;
    const link = `https://${language}.pornhub.com/users/${username}/videos`;
    if (!isValidHost(language)) {
        throw Error('Invalid language');
    }

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.videoUList .videoBox');

    ctx.state.data = {
        title: $('title').first().text(),
        link,
        allowEmpty: true,
        item:
            list &&
            list
                .map((_, e) => {
                    e = $(e);

                    return {
                        title: e.find('span.title a').text(),
                        link: `https://www.pornhub.com` + e.find('span.title a').attr('href'),
                        description: `<img src="${e.find('img.thumb').attr('data-thumb_url')}">`,
                    };
                })
                .get(),
    };
};
