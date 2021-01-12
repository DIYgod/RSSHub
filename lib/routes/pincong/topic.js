const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://pincong.rocks/topic/' + ctx.params.topic;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(
        () =>
            // eslint-disable-next-line no-undef
            (document.querySelector('div.aw-common-list') && document.querySelector('div.aw-common-list').innerHTML) || ''
    );

    browser.close();

    const $ = cheerio.load(html);
    const list = $('div.aw-item');

    ctx.state.data = {
        title: `品葱 - ${ctx.params.topic}`,
        link: url,
        item: list
            .map((_, item) => ({
                title: $(item).find('h4 a').text().trim(),
                link: 'https://pincong.rocks' + $(item).find('h4 a').attr('href'),
                pubDate: new Date($(item).attr('data-timestamp') * 1000).toISOString(),
            }))
            .get(),
    };
};
