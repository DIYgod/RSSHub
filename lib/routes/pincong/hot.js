const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let url = 'https://pincong.rocks/hot/list/';

    url += ctx.params.category ? 'category-' + ctx.params.category : 'category-0';

    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => document.documentElement.innerHTML
    );

    browser.close();

    const $ = cheerio.load(html);
    const list = $('div.aw-item');

    ctx.state.data = {
        title: '品葱 - 精选',
        link: 'https://pincong.rocks/hot/',
        item: list
            .map((_, item) => ({
                title: $(item).find('h2 a').text().trim(),
                description: $(item).find('div.markitup-box').html(),
                link: 'https://pincong.rocks' + $(item).find('div.mod-head h2 a').attr('href'),
            }))
            .get(),
    };
};
