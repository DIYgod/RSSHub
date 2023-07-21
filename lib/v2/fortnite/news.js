const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const options = ctx.params.options?.split('&').map((op) => op.split('='));

    const rootUrl = 'https://www.fortnite.com';
    const path = 'news';
    const language = options?.find((op) => op[0] === 'lang')[1] ?? 'en-US';
    const link = `${rootUrl}/${path}?lang=${language}`;
    const apiUrl = `https://www.fortnite.com/api/blog/getPosts?category=&postsPerPage=0&offset=0&locale=${language}&rootPageSlug=blog`;

    // using puppeteer instead instead of got
    // whitch may be blocked by anti-crawling script with response code 403
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();

    // intercept all requests
    await page.setRequestInterception(true);
    // only document is allowed
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    // get json data in response event handler
    let data;
    page.on('response', async (res) => {
        data = await res.json();
    });

    // log manually (necessary for puppeteer)
    logger.debug(`Requesting ${apiUrl}`);
    await page.goto(apiUrl, {
        waitUntil: 'networkidle0', // if use 'domcontentloaded', `await page.content()` is necessary
    });

    await page.close();
    browser.close();

    const { blogList: list } = data;
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, () => ({
                title: item.title,
                link: `${rootUrl}/${path}/${item.slug}?lang=${language}`,
                pubDate: parseDate(item.date),
                author: item.author,
                description: item.content, // includes <img /> & full text
            }))
        )
    );

    ctx.state.data = {
        title: 'Fortnite News',
        link,
        item: items,
    };
};
