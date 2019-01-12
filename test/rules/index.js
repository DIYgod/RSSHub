const status = require('./status');
const rss = require('./rss');

module.exports = async (response) => {
    status(response);
    await rss(response);
};
