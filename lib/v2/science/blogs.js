const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl } = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { name = 'pipeline' } = ctx.params;
    const link = `${baseUrl}/blogs/${name}/feed`;

    const response = await ctx.cache.tryGet(
        link,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });

            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });

            const response = await page.content();

            page.close();
            browser.close();
            return response;
        },
        config.cache.routeExpire,
        false
    );

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

    // The RSS feed is implemented by a keyword search on the science.org end
    // so the description field of the feed looks like this:
    const name_re = /Keyword search result for Blog Series: (?<blog_name>[^-]+) --/;
    const { blog_name = 'Unknown Title' } = $('channel > description').text().match(name_re).groups;

    ctx.state.data = {
        title: `Science Blogs: ${blog_name}`,
        description: `A Science.org blog called ${blog_name}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: `${baseUrl}/blogs/${name}`,
        language: 'en-US',
        item: items,
    };
};
