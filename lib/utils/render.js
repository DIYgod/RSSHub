const art = require('art-template');
const json = require('@/views/json');
const rss3Ums = require('@/views/rss3-ums');

// We may add more control over it later

module.exports = {
    art,
    json, // This should be used by RSSHub middleware only.
    rss3Ums,
};
