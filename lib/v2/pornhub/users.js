const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');
const { headers, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { language = 'www', username } = ctx.params;
    const link = `https://${language}.pornhub.com/users/${username}/videos`;
    if (!isValidHost(language)) {
        throw Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = cheerio.load(response);
    const items = $('.videoUList .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    ctx.state.data = {
        title: $('title').first().text(),
        description: $('.aboutMeText').text().trim(),
        link,
        image: $('#coverPictureDefault').attr('src'),
        logo: $('#getAvatar').attr('src'),
        icon: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        allowEmpty: true,
        item: items,
    };
};
