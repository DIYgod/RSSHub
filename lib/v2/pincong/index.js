const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    let url = `${baseUrl}/`;

    const sortMap = {
        new: 'sort_type-new',
        recommend: 'recommend-1',
        hot: 'sort_type-hot__day2',
    };

    url += (ctx.params.sort && sortMap[ctx.params.sort]) || 'recommend-1';
    url += ctx.params.category ? '__category-' + ctx.params.category : '';

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, ctx.cache);

    const $ = cheerio.load(html);
    const list = $('div.aw-item');

    ctx.state.data = {
        title: '品葱 - 发现',
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
