const config = require('@/config').value;
const Parser = require('rss-parser');

const parser = new Parser({
    customFields: {
        item: ['magnet'],
    },
    headers: {
        'User-Agent': config.ua,
    },
});

module.exports = parser;
