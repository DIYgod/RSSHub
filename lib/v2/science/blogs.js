const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

const { baseUrl } = require('./utils');

module.exports = async (ctx) => {
    const { name = 'pipeline' } = ctx.params;
    const link = `${baseUrl}/blogs/${name}/feed`;

    const response = await ctx.cache.tryGet(link, async () => {
        // require puppeteer utility class and initialise a browser instance
        const browser = await require('@/utils/puppeteer')();
        // open a new tab
        const page = await browser.newPage();
        // intercept all requests
        await page.setRequestInterception(true);
        // only allow certain types of requests to proceed
        page.on('request', (request) => {
            // in this case, we only allow document requests to proceed
            request.resourceType() === 'document' ? request.continue() : request.abort();
        });
        // visit the target link
        // got requests will be logged automatically
        // but puppeteer requests are not
        // so we need to log them manually
        logger.debug(`Requesting ${link}`);
        await page.goto(link, {
            // specify how long to wait for the page to load
            waitUntil: 'domcontentloaded',
        });
        // retrieve the HTML content of the page
        const response = await page.content();
        // close the tab
        page.close();
        browser.close();
        return response;
    });

    const $ = cheerio.load(response, { xmlMode: true });
    const items = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('title').text().trim(),
                link: item.find('link').text().trim(),
                author: item.find('dc\\:creator').text().trim(),
                pubDate: parseDate(item.find('pubDate').text().trim()),
                description: item.find('content\\:encoded').text().trim(),
            };
        });

    ctx.state.json = {
        response,
        // $,
        items,
    };

    ctx.state.data = {
        title: `Science Blogs: ${name}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: `${baseUrl}/blogs/${name}`,
        language: 'en-US',
        item: items,
    };
};
