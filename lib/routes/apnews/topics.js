const cheerio = require('cheerio');

const HOME_PAGE = 'https://apnews.com';

module.exports = async (ctx) => {
    const topic = ctx.params.topic;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    const url_link = `${HOME_PAGE}/hub/${topic}`;
    await page.goto(url_link);
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    browser.close();

    const $ = cheerio.load(html);

    const list = $('div.FeedCard');

    ctx.state.data = {
        title: $('.Body div').find('h1[class^=hubTitle]').text(),
        link: HOME_PAGE,
        item: list
            .slice(0, 5)
            .map((index, item) => {
                item = $(item);
                const title = item.find('h1[class^=Component-h1]').text();
                const link = item.find('a[class^=Component-headline-]').attr('href');
                const pubDate = item.find('span[class^=Timestamp]').attr('title');
                const text = item.find('div[class^=content]').text();
                const imageUrl = item.find('img[class^=image-]').attr('src');
                const author = item.find('span[class^=Component-bylines-]').text().slice(3);

                return {
                    title,
                    description: `<img src="${imageUrl}">` + text,
                    link: `${HOME_PAGE}${link}`,
                    pubDate,
                    author,
                };
            })
            .get(),
    };
};
