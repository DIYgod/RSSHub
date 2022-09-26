const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

const owner = '中央纪委国家监委网站';
const rootUrl = 'https://www.ccdi.gov.cn';

const parseNewsList = async (url, selector, ctx) => {
    const response = await got(url, { cookieJar });
    const $ = cheerio.load(response.data);
    const list = $(selector)
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 8)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').first().text().trim(),
                link: new URL(item.find('a').first().attr('href'), url).href,
                pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
            };
        });
    const title = $('.other_Location')
        .text()
        .replace(/(.+)首页/, owner);
    return { list, title };
};

const parseArticle = async (item, ctx) =>
    await ctx.cache.tryGet(item.link, async () => {
        const response = await got(item.link, { cookieJar });
        const $ = cheerio.load(response.data);

        const title = $('.daty').text().trim();
        item.author = title.match(/来源：(.*)发布时间/s)?.[1].trim() ?? owner;
        item.pubDate = timezone(parseDate(title.match(/发布时间：(.*)分享/s)?.[1].trim() ?? item.pubDate), +8);

        // Change the img src from relative to absolute for a better compatibility
        $('.content')
            .find('img')
            .each((_, el) => {
                $(el).attr('src', new URL($(el).attr('src'), item.link).href);
                // oldsrc is causing freshrss imageproxy not to work correctly
                $(el).removeAttr('oldsrc').removeAttr('alt');
            });
        item.description = $('.content').html();
        return item;
    });

module.exports = {
    rootUrl,
    parseNewsList,
    parseArticle,
};
