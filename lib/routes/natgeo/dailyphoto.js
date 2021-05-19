const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    const link = 'https://www.nationalgeographic.com/photo-of-the-day/media-spotlight/';
    await page.goto(link);
    const html = await page.evaluate(
        () =>
        document.querySelector('div.InlineGallery').innerHTML
    );
    browser.close();

    const $ = cheerio.load(html);

    const imgUrl = $('img').attr('src');
    const title = $('p.Caption__Title').text();
    const description = $('span.RichText').text();
    const author = $('span.Caption__Credit').text();
    
    const out = new Array;
    
    const info = {
        title: title,
        link: link,
        description: `<img src="${imgUrl}"><br>` + 'Photography by: ' + author + '<br>' + description,
    };
    out.push(info);

    ctx.state.data = {
        title: 'Photo Of The Day',
        link: link,
        item: out,
    };
};
