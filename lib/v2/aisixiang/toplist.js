const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl, ossUrl, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const { id = '1', period = '1' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`toplist${id ? `?id=${id}${id === '1' ? `&period=${period}` : ''}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const title = `${$('a.hl').text() || ''}${$('title').text().split('_')[0]}`;

    const items = $('div.tops_list')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.tips a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                author: item.find('div.name').text(),
                pubDate: parseDate(item.find('div.times').text()),
            };
        });

    ctx.state.data = {
        item: await ProcessFeed(limit, ctx.cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        language: 'zh-cn',
        image: new URL('images/logo_toplist.jpg', ossUrl).href,
        subtitle: title,
    };
};
