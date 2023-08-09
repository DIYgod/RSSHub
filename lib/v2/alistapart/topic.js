const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { topic } = ctx.params;
    const baseUrl = 'https://alistapart.com';
    let route;
    if (topic) {
        route = `/blog/topic/${topic}`;
    } else {
        route = '/articles';
    }
    const { data: response } = await got(`${baseUrl}${route}`);
    const $ = cheerio.load(response);

    const listItems = $('main.site-main article')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h2.entry-title a');
            const author = item
                .find('span.author a span')
                .toArray()
                .map((item) => $(item).text())
                .join(', ');
            const pubDate = item.find('span.posted-on time.entry-date').attr('datetime');
            const updated = item.find('span.posted-on time.updated').attr('datetime');
            return {
                title: a.text(),
                link: String(a.attr('href')),
                pubDate,
                author,
                updated,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.category = $('div.entry-topic span.cat-links a')
                    .toArray()
                    .map((item) => $(item).text());
                item.description = $('div.entry-content')
                    .clone()
                    .children('div')
                    .remove()
                    .end()
                    .map((index, element) => $(element).html())
                    .get()
                    .join('');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'A List Apart',
        link: `${baseUrl}${route}`,
        item: items,
        description: 'Articles on aListApart.com',
        logo: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=192,192&ssl=1',
        icon: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=32,32&ssl=1',
        language: 'en-us',
    };
};
