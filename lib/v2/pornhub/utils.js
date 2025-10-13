const { art } = require('@/utils/render');
const { join } = require('path');
const { parseRelativeDate } = require('@/utils/parse-date');

const defaultDomain = 'https://www.pornhub.com';

const headers = {
    accessAgeDisclaimerPH: 1,
    hasVisited: 1,
};

const renderDescription = (data) => art(join(__dirname, 'templates/description.art'), data);

const parseItems = (e) => ({
    title: e.find('span.title a').text().trim(),
    link: defaultDomain + e.find('span.title a').attr('href'),
    description: renderDescription({
        poster: e.find('img').data('mediumthumb'),
        previewVideo: e.find('img').data('mediabook'),
    }),
    author: e.find('.usernameWrap a').text(),
    pubDate: parseRelativeDate(e.find('.added').text()),
});

module.exports = {
    defaultDomain,
    headers,
    renderDescription,
    parseItems,
};
