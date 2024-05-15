const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://www.autotrader.co.uk/results-car-search?${ctx.params.query}`;
    const response = await got.get(link);

    const $ = cheerio.load(response.data.html);

    const idList = $('li.search-page__result').slice(0, 10).get();

    const items = await Promise.all(
        idList.map(async (item) => {
            const link = `https://www.autotrader.co.uk/classified/advert/${item.attribs.id}`;

            const cache = await ctx.cache.get(link);

            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(link);
            const $ = cheerio.load(response.data);

            let keyFacts = '<table><tr>';
            $('.keyFacts__list .keyFacts__label').each((i, e) => {
                keyFacts += `<td>${$(e).text()}</td>`;
                if ((i + 1) % 4 === 0) {
                    keyFacts += '</tr><tr>';
                }
            });
            keyFacts += '</tr><tr>';

            $('.fpaSpecifications__economy .fpaSpecifications__listItem').each((i, e) => {
                keyFacts += `<td>${$(e).find('.fpaSpecifications__term').text()}: ${$(e).find('.fpaSpecifications__description').text()}</td>`;
                if ((i + 1) % 4 === 0) {
                    keyFacts += '</tr><tr>';
                }
            });

            keyFacts += '</tr></table><br/>';

            let images = '';

            $('.fpa-image-overlay img').each((i, e) => {
                images += `<img src='${$(e).attr('data-src')}'/><br/>`;
            });

            const description = keyFacts + images + $('meta[name="og:description"]').attr('content');

            const title = `「${$('.fpaGallery__priceLabel').text()}」${$('meta[name="og:title"]').attr('content')}`;

            const single = {
                title,
                description,
                pubDate: new Date().toISOString(),
                link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: 'Auto Trader',
        link,
        item: items,
    };
};
