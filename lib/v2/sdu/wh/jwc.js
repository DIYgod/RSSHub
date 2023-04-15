const got = require('@/utils/got');
const cheerio = require('cheerio');
const data = require('../data').wh.jwc;
const extractor = require('../extractor');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const column = ctx.params.column ?? 'gztz';
    const baseUrl = data.url;
    const response = await got(baseUrl + data.columns[column].url);
    const $ = cheerio.load(response.data);
    const items = $('.articleul li');
    const out = await Promise.all(
        items.map(async (index, item) => {
            item = $(item);
            const anchor = item.find('a');
            const dateElement = item.find('div:last-of-type');
            const dateText = dateElement.text();
            dateElement.remove();
            const href = anchor.attr('href');
            const link = href.startsWith('http') ? href : baseUrl + href;
            const title = item.text();
            const { description, author: exactAuthor, exactDate } = await ctx.cache.tryGet(link, () => extractor(link, ctx));
            const author = exactAuthor ?? '教务处';
            const pubDate = exactDate ?? timezone(parseDate(dateText.slice(1, dateText.length - 1), 'YYYY-MM-DD'), +8);
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
