const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, puppeteerGet } = require('./utils');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const catyUrl = `${baseUrl}/${ctx.params.caty}/?chdtv`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(catyUrl, ctx.cache);

    const $ = cheerio.load(html);
    const detailsUrls = $('.title > a')
        .map((index, element) => $(element).attr('href'))
        .get();
    const items = await Promise.all(
        detailsUrls.map(async (url) => {
            const detail = await puppeteerGet(url, ctx.cache);
            const $d = cheerio.load(detail);

            return {
                title: $d('meta[property="og:title"]').attr('content'),
                link: url,
                description: $d('#article-body').html(),
                pubDate: timezone(parseDate($d('meta[name="pubdate"]').attr('content')), +8),
                author: $d('.author').text(),
                category: 'listCategory',
            };
        })
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: catyUrl,
        category: 'listCategory',
        item: items,
    };
};
