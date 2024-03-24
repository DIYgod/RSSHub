import * as path from 'node:path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
    // Changes the cache location for Puppeteer.
    cacheDirectory: path.join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
