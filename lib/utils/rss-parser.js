const config = require('@/config');
const Parser = require('rss-parser');

const parser = new Parser({
    customFields: {
        item: ['magnet'],
    },
    headers: {
        'User-Agent': config.ua,
        'X-APP': 'RSSHub',
    },
});

module.exports = parser;
