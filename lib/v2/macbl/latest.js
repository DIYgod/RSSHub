const got = require('@/utils/got');
const cheerio = require('cheerio');
const rootUrl = 'https://www.macbl.com';

module.exports = async (ctx) => {
    const url = `https://www.macbl.com/app/new`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('body > div.list-wrap.inner > div > ul > li')
        .map((_, item) => ({
            title: $(item).find('a > div.item-right.col > div.hd').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
            pubDate: $(item).find('div.item-right.col > div.bd > span > span').text(),
            description: $(item).find('div.item-right.col > div.md').text(),
            category: $(item).find('div.item-right.col > div.md > span').text(),
        }))
        .get();

    ctx.state.data = {
        title: '马可波罗MacBL - 最近更新',
        link: url,
        item: list,
    };
};
