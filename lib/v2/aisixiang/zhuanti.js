const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl, ossUrl, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`zhuanti/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const title = $('div.tips h2').first().text();

    const items = $('div.article-title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                author: a.text().split('：')[0],
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });

    ctx.state.data = {
        item: await ProcessFeed(limit, ctx.cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        description: $('div.tips p').text(),
        language: 'zh-cn',
        image: new URL('images/logo_zhuanti.jpg', ossUrl).href,
        subtitle: title,
    };
};
