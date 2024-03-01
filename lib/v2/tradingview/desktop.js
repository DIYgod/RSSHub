const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL('/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    $('h4[data-identifyelement]').each((_, el) => {
        el = $(el);

        if (el.text().trim() === '') {
            el.remove();
        }
    });

    const items = $('h4[data-identifyelement]')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const title = item.text();
            const description = $.html(item.nextUntil('h4'));
            const content = cheerio.load(description);

            return {
                title,
                link: currentUrl,
                description,
                category: content('h5')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `tradingview-desktop#${title.split(/versions?\s/).pop()}`,
                pubDate: timezone(parseDate(title.split(/\./)[0], 'MMMM D, YYYY'), +8),
            };
        });

    const title = $('title').text();
    const titleSplits = title.split(/—/);
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title,
        link: currentUrl,
        description: titleSplits[0],
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: titleSplits[0],
        author: titleSplits.pop(),
    };
};
