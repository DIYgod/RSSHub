const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto('https://www.hhgal.com/');
    const htmlHandle = await page.$('html');
    const html = await page.evaluate((html) => html.innerHTML, htmlHandle);
    browser.close();

    const $ = cheerio.load(html);
    const list = $('#article-list').find('.article');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.hhgal.com/',
        description: '忧郁的loli - Galgame资源发布站',
        item:
            list &&
            list
                .slice(1)
                .map((index, item) => {
                    item = $(item);
                    const time = `${item.find('.tag-article .label.label-zan').text()}`;
                    const math = /\d{4}-\d{2}-\d{2}/.exec(time);
                    const pubdate = new Date(math[0]);

                    return {
                        title: item.find('h1').text(),
                        description: `${item.find('.info p').text()}`,
                        pubDate: pubdate,
                        link: item.find('h1 a').attr('href'),
                    };
                })
                .get(),
    };
};
