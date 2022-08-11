const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';

    const rootUrl = 'https://pubs.acs.org';
    const currentUrl = `${rootUrl}/toc/${id}/0/0`;

    let title = '';

    const browser = await require('@/utils/puppeteer')();
    const items = await ctx.cache.tryGet(
        currentUrl,
        async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(currentUrl, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('.toc');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await page.close();

            const $ = cheerio.load(html);

            title = $('meta[property="og:title"]').attr('content');

            return $('.issue-item')
                .toArray()
                .map((item) => {
                    item = $(item);

                    const a = item.find('.issue-item_title a');
                    const doi = item.find('input[name="doi"]').attr('value');

                    return {
                        doi,
                        guid: doi,
                        title: a.text(),
                        link: `${rootUrl}${a.attr('href')}`,
                        pubDate: parseDate(item.find('.pub-date-value').text(), 'MMMM D, YYYY'),
                        author: item
                            .find('.issue-item_loa li')
                            .toArray()
                            .map((a) => $(a).text())
                            .join(', '),
                        description: art(path.join(__dirname, 'templates/description.art'), {
                            image: item.find('.issue-item_img').html(),
                            description: item.find('.hlFld-Abstract').html(),
                        }),
                    };
                });
        },
        config.cache.routeExpire,
        false
    );

    await browser.close();

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
