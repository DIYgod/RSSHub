const art = require('art-template');
const json = require('@/views/json');

// We may add more control over it later

module.exports = {
    art,
    json, // This should be used by RSSHub middleware only.
};
