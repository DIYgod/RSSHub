const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    let url = 'https://www.rfa.org/' + (ctx.params.language ?? 'english');

    if (ctx.params.channel) {
        url += '/' + ctx.params.channel;
    }
    if (ctx.params.subChannel) {
        url += '/' + ctx.params.subChannel;
    }

    const response = await got(url);
    const $ = cheerio.load(response.data);

    const selectors = ['div[id=topstorywidefull]', 'div.two_featured', 'div.three_featured', 'div.single_column_teaser', 'div.sectionteaser', 'div.specialwrap'];
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
                const content = await got(item.link);

                const description = cheerio.load(content.data);
                item.description = description('#headerimg').html() + description('div[id=storytext]').html();
                item.pubDate = parseDate(description('span[id=story_date]').text());
                if (description('meta[property=og:audio]').attr('content') !== undefined) {
                    item.enclosure_url = description('meta[property=og:audio]').attr('content');
                    item.enclosure_type = description('meta[property=og:audio:type]').attr('content');
                }
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
