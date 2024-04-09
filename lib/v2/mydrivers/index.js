const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { rootUrl, title, categories, convertToQueryString, getInfo, processItems } = require('./util');

module.exports = async (ctx) => {
    let { category = 'new' } = ctx.params;

    let newTitle = '';

    if (!/^(\w+\/\w+)$/.test(category)) {
        newTitle = `${title} - ${categories.hasOwnProperty(category) ? categories[category] : categories[Object.keys(categories)[0]]}`;
        category = `ac/${category}`;
    }

    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const queryString = convertToQueryString(category);
    const currentUrl = new URL(`newsclass.aspx${queryString}`, rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx${queryString}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = cheerio.load(response);

    let items = $('li[data-id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.news_title').text(),
                link: new URL(item.find('div.news_title span.newst a').prop('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: item.find('a.newsimg img').prop('src'),
                }),
                author: item.find('p.tname').text(),
                guid: item.prop('data-id'),
                pubDate: timezone(parseDate(item.find('p.ttime').text()), +8),
                comments: item.find('a.tpinglun').text() ? parseInt(item.find('a.tpinglun').text(), 10) : 0,
            };
        });

    items = await processItems(items, ctx.cache.tryGet);

    ctx.state.data = {
        ...(await getInfo(currentUrl, ctx.cache.tryGet)),
        ...Object.fromEntries(
            Object.entries({
                item: items,
                title: newTitle,
            }).filter(([value]) => value)
        ),
    };
};
