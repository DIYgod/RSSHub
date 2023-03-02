const got = require('@/utils/got');
const cheerio = require('cheerio');
const data = require('../data').wh.news;
const extractor = require('../extractor');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const column = ctx.params.column ?? 'xyyw';
    const baseUrl = data.url;
    const response = await got(baseUrl + data.columns[column].url);
    const $ = cheerio.load(response.data);
    const items = $('.n_newslist li');
    const out = await Promise.all(
        items.map(async (index, item) => {
            item = $(item);
            const anchor = item.find('a');
            const title = anchor.attr('title');
            const href = anchor.attr('href');
            const link = href.startsWith('http') ? href : baseUrl + href;
            const { description, author, exactDate } = await ctx.cache.tryGet(link, () => extractor(link, ctx));
            const span = item.find('span');
            const pubDate = exactDate ?? parseDate(span.text(), 'YYYY/MM/DD');
            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        })
    );

    ctx.state.data = {
        title: `${data.name} ${data.columns[column].name}`,
        link: baseUrl + data.columns[column].url,
        item: out,
    };
};
