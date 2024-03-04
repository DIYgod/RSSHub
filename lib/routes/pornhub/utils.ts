// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseRelativeDate } from '@/utils/parse-date';
const dayjs = require('dayjs');

const defaultDomain = 'https://www.pornhub.com';

const headers = {
    accessAgeDisclaimerPH: 1,
    hasVisited: 1,
};

const renderDescription = (data) => art(path.join(__dirname, 'templates/description.art'), data);
const extractDateFromImageUrl = (imageUrl) => {
    const matchResult = imageUrl.match(/(\d{6})\/(\d{2})/);
    return matchResult ? matchResult.slice(1, 3).join('') : null;
};

const parseItems = (e) => ({
    title: e.find('span.title a').text().trim(),
    link: defaultDomain + e.find('span.title a').attr('href'),
    description: renderDescription({
        poster: e.find('img').data('mediumthumb'),
        previewVideo: e.find('img').data('mediabook'),
    }),
    author: e.find('.usernameWrap a').text(),
    pubDate: dayjs(extractDateFromImageUrl(e.find('img').data('mediumthumb'))) || parseRelativeDate(e.find('.added').text()),
});

module.exports = {
    defaultDomain,
    headers,
    renderDescription,
    parseItems,
};
