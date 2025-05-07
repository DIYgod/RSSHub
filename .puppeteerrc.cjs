const path = require('node:path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the cache location for Puppeteer.
    cacheDirectory: path.join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
