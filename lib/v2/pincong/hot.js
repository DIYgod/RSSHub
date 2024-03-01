const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    const { category = '0' } = ctx.params;

    const url = `${baseUrl}/hot/list/category-${category}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, ctx.cache);

    const $ = cheerio.load(html);
    const list = $('div.aw-item');

    ctx.state.data = {
        title: '品葱 - 精选',
        link: `${baseUrl}/hot/${category === '0' ? '' : `category-${category}`}`,
        item: list
            .map((_, item) => ({
                title: $(item).find('h2 a').text().trim(),
                description: $(item).find('div.markitup-box').html(),
                link: baseUrl + $(item).find('div.mod-head h2 a').attr('href'),
                pubDate: parseDate($(item).find('div.mod-footer .aw-small-text').text()),
            }))
            .get(),
    };
};
