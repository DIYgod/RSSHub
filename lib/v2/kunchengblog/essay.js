const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { SourceMapConsumer } = require('source-map');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const rootUrl = 'https://www.kunchengblog.com';

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    const currentUrl = `${rootUrl}/essay`;
    const mapUrl = `${rootUrl}${response.data.match(/"(\/static\/js\/main.*?\.js)">/)[1]}.map`;

    response = await got({
        method: 'get',
        url: mapUrl,
    });

    const items = await SourceMapConsumer.with(response.data, null, (consumer) =>
        consumer.sources
            .filter((s) => /routes\/essays/.test(s))
            .slice(0, limit)
            .map((item) => {
                const source = consumer.sourceContentFor(item).replace(/\n/g, '');

                const content = cheerio.load(source);

                return {
                    title: content('title').text(),
                    pubDate: parseDate(content('b').last().text(), 'MMM YYYY'),
                    link: `${rootUrl}/essay/${item.match(/\/essays\/(.*?)\.js/)[1].toLowerCase()}`,
                    description: content('p')
                        .toArray()
                        .map((p) => content(p).html())
                        .join(),
                };
            })
    );

    ctx.state.data = {
        title: 'KUN CHENG - Essay',
        link: currentUrl,
        item: items,
    };
};
