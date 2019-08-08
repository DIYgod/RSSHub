const config = require('@/config');
const Parser = require('rss-parser');
const got = require('@/utils/got');

const parser = new Parser({
    customFields: {
        item: ['magnet'],
    },
    headers: {
        'User-Agent': config.ua,
        'X-APP': 'RSSHub',
    },
});

parser.parseURL = async (url) => {
    const response = await got.get(url);
    return parser.parseString(response.data);
};

module.exports = parser;
