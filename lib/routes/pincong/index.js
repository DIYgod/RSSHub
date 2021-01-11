const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let url = 'https://pincong.rocks/';

    const sortMap = {
        new: 'sort_type-new',
        recommend: 'recommend-1',
        hot: 'sort_type-hot__day2',
    };

    url += (ctx.params.sort && sortMap[ctx.params.sort]) || 'recommend-1';
    url += ctx.params.category ? '__category-' + ctx.params.category : '';

    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => document.querySelector('div.aw-common-list').innerHTML
    );

    browser.close();

    const $ = cheerio.load(html);
    const list = $('div.aw-item');

    ctx.state.data = {
        title: '品葱 - 发现',
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
