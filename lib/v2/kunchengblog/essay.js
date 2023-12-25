const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { SourceMapConsumer } = require('source-map');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 100;

    const rootUrl = 'https://www.kunchengblog.com';
    const currentUrl = new URL('essay', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const title = $('title').text();

    const mapUrl = new URL(`${$('script').first().prop('src')}.map`, rootUrl).href;

    const { data: response } = await got(mapUrl);

    const items = await SourceMapConsumer.with(response, null, (consumer) =>
        consumer.sources
            .filter((s) => /routes\/essays/.test(s))
            .reverse()
            .slice(0, limit)
            .map((item) => {
                const source = consumer.sourceContentFor(item).replace(/\s\n/g, '');

                const processedSource = source.replace(/(\w+)=\{+([^{}]+)\}+/g, (match, key, value) => {
                    const processedValue = value.slice(1, -1).replace(/"/g, "'").trim();
                    return `${key}="${processedValue}"`;
                });

                const content = cheerio.load(processedSource);

                return {
                    title: content('title').text(),
                    pubDate: parseDate(content('p[className="App-essay-article"]').last().find('b').first().text(), 'MMM YYYY'),
                    link: new URL(`essay/${item.match(/\/(\w+)\.js/)[1].toLowerCase()}`, currentUrl).href,
                    description: content('p[className="App-essay-article"]')
                        .toArray()
                        .map((p) => content(p).html())
                        .join(),
                    author: title,
                };
            })
    );

    const description = $('meta[name="description"]').prop('content');
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${title} - Essay`,
        link: currentUrl,
        description,
        language: $('html').prop('lang'),
        image: icon,
        icon,
        logo: icon,
        subtitle: description,
        author: title,
        allowEmpty: true,
    };
};
