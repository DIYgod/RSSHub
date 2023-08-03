const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    news: 0,
    blogs: 1,
};

module.exports = async (ctx) => {
    const { category = 'News' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 200;

    if (!categories.hasOwnProperty(category.toLowerCase())) {
        throw Error(`No category '${category}'.`);
    }

    const rootUrl = 'https://finviz.com';
    const currentUrl = new URL('news.ashx', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const items = $('table.table-fixed')
        .eq(categories[category.toLowerCase()])
        .find('tr.nn')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.nn-tab-link');

            const descriptionMatches = a
                .parent()
                .prop('data-boxover')
                ?.match(/<td class='news_tooltip-tab'>(.*?)<\/td>/);
            const authorMatches = item
                .find('use')
                .first()
                .prop('href')
                ?.match(/#(.*?)-(light|dark)/);

            return {
                title: a.text(),
                link: a.prop('href'),
                description: descriptionMatches ? descriptionMatches[1] : undefined,
                author: authorMatches ? authorMatches[1].replace(/-/g, ' ') : 'finviz',
                pubDate: timezone(parseDate(item.find('td.nn-date').text(), ['HH:mmA', 'MMM-DD']), -4),
            };
        })
        .filter((item) => item.title);

    const icon = $('link[rel="icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title: `finviz - ${category}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'en-US',
        image: new URL($('a.logo svg use').first().prop('href'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('title').text(),
    };
};
