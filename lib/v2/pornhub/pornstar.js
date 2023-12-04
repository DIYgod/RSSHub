const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');
const { headers, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { language = 'www', username, sort = 'mr' } = ctx.params;
    const link = `https://${language}.pornhub.com/pornstar/${username}/videos?o=${sort}`;
    if (!isValidHost(language)) {
        throw Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = cheerio.load(response);
    const items = $('#mostRecentVideosSection .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    ctx.state.data = {
        title: $('title').first().text(),
        description: $('section.aboutMeSection').text().trim(),
        link,
        image: $('#coverPictureDefault').attr('src'),
        logo: $('#getAvatar').attr('src'),
        icon: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        item: items,
    };
};
