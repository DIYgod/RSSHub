const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    const url = `${baseUrl}/topic/${ctx.params.topic}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, ctx.cache);

    const $ = cheerio.load(html);
    const list = $('div.aw-item');

    ctx.state.data = {
        title: `品葱 - ${ctx.params.topic}`,
        link: url,
        item: list
            .map((_, item) => ({
                title: $(item).find('h4 a').text().trim(),
                link: baseUrl + $(item).find('h4 a').attr('href'),
                pubDate: parseDate($(item).attr('data-created-at') * 1000),
            }))
            .get(),
    };
};
