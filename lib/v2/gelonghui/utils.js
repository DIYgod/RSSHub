const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

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
            if (!item.pubDate) {
                const isRelativeDate = $('time.date').text().includes('前') || $('time.date').text().includes('天');
                item.pubDate = isRelativeDate ? parseRelativeDate($('time.date').text()) : timezone(parseDate($('time.date').text(), 'MM-DD HH:mm'), +8);
            }
        }
        return item;
    });

module.exports = {
    parseItem,
};
