const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.researchgate.net';
    const currentUrl = `${rootUrl}/profile/${id}`;
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(currentUrl);
    const response = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();

    const $ = cheerio.load(response);

    const list = $('div[itemprop="headline"] a')
        .toArray()
        .slice(0, ctx.query.limit ? Number(ctx.query.limit) : 15)
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await page.goto(item.link);
                const detailResponse = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();
                const content = cheerio.load(detailResponse);

                item.doi = content('meta[property="citation_doi"]').attr('content');
                item.pubDate = parseDate(content('meta[property="citation_publication_date"]').attr('content'));

                const authors = [];

                content('meta[property="citation_author"]').each(function () {
                    authors.push(content(this).attr('content'));
                });

                item.author = authors.join(', ');

                item.description = content('div[itemprop="description"]').html();

                return item;
            })
        )
    );

    await browser.close();

    ctx.state.data = {
        title: `${$('meta[property="profile:username"]').attr('content')}'s Publications - ResearchGate`,
        link: currentUrl,
        item: items,
    };
};
