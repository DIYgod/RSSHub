const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    let url = 'https://www.rfa.org/' + (ctx.params.language || 'english');

    if (ctx.params.channel) {
        url += '/' + ctx.params.channel;
    }
    if (ctx.params.subChannel) {
        url += '/' + ctx.params.subChannel;
    }

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const selectors = ['div[id=topstorywidefulltease]', 'div.two_featured', 'div.three_featured', 'div.single_column_teaser', 'div.sectionteaser', 'div.specialwrap'];
    const list = [];
    selectors.forEach((selector) => {
        $(selector).each((_, e) => {
            const item = {};
            item.title = $(e).find('h2 a span').first().text();
            item.link = $(e).find('h2 a').first().attr('href');
            list.push(item);
        });
    });

    const result = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const content = await got.get(item.link);

                const description = cheerio.load(content.data);
                item.description = description('div[id=storytext]').html();
                item.pubDate = new Date(description('span[id=story_date]').text()).toUTCString();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'RFA',
        link: 'https://www.rfa.org/',
        item: result,
    };
};
