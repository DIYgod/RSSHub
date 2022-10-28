const got = require('@/utils/got');
const cheerio = require('cheerio');

const parseItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: res } = await got(item.link);
        const $ = cheerio.load(res);
        if (item.link.startsWith('https://www.gelonghui.com/live/')) {
            item.title = $('.type-name').next().text().trim();
            item.description = $('.dtb-content').html();
        } else {
            // article
            item.title = $('.article-title').text().trim();
            item.description = $('.article-summary').html() + $('article.article-with-html').html();
        }
        return item;
    });

module.exports = {
    parseItem,
};
