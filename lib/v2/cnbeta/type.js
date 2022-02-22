const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const id = ctx.params.id;

    const currentUrl = `${rootUrl}/${type}/${id}.htm`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const token = encodeURI($('meta[name="csrf-token"]').attr('content'));
    const apiUrl = `${rootUrl}/home/more?&type=${$('div[data-type]').attr('data-type')}&page=1&_csrf=${token}&_=${new Date().getTime()}`;

    response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.result.list.map((item) => ({
        title: item.title,
        description: item.hometext,
        author: item.source.split('@http')[0],
        pubDate: timezone(parseDate(item.inputtime), +8),
        link: item.url_show.indexOf('//') === 0 ? `https:${item.url_show}` : item.url_show,
    }));

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: await ProcessItems(items, ctx.query.limit, ctx.cache.tryGet),
    };
};
