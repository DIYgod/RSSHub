const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const baseUrl = 'https://www.smashingmagazine.com';
    const route = category ? `/category/${category}` : '/articles';
    const { data: response } = await got(`${baseUrl}${route}`);
    const $ = cheerio.load(response);

    const listItems = $('article.article--post')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h2.article--post__title a');
            const description = item.find('p.article--post__teaser').clone().children().remove().end().text();
            const author = item.find('span.article--post__author-name a').text();
            const time = $('p.article--post__teaser time').attr('datetime');
            const pubDate = parseDate(time, 'YYYY-MM-DD');
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate,
                description,
                author,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.category = $('li.meta-box--tags a')
                    .toArray()
                    .map((item) => $(item).text());
                const header = $('div#article__content header.article-header').clone().children('ul').remove().end().html();
                const summary = $('div#article__content section.article__summary').html();
                const descr = $('div#article__content div.c-garfield-the-cat')
                    .clone()
                    .children('div')
                    .remove()
                    .end()
                    .toArray()
                    .map((element) => $(element).html());
                item.description = [header, summary, ...descr].join('');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Smashing Magazine Articles',
        link: `${baseUrl}${route}`,
        item: items,
        description: 'Latest Articles on Smashingmagazine.com',
        logo: 'https://www.smashingmagazine.com/images/favicon/apple-touch-icon.png',
        icon: 'https://www.smashingmagazine.com/images/favicon/favicon.svg',
        language: 'en-us',
    };
};
