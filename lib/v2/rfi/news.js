const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.rfi.fr/';
    const path = ctx.params.path ?? 'en';
    const currentUrl = `${rootUrl}${path.endsWith('/') ? path : `${path}/`}`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    $('aside[data-org-type="aside-content--highlighted"], aside[data-org-type="aside-content--sponsors"]').remove();

    let items = $('.article__title a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                content('.m-interstitial, .m-em-quote svg, .o-self-promo').remove();

                const ldJson = JSON.parse(content('script[type="application/ld+json"]').text() || '[]').find((x) => x['@type'] === 'NewsArticle');

                item.description = content('.t-content__chapo').prop('outerHTML') + content('.t-content__main-media').prop('outerHTML') + content('.t-content__body').html();
                item.pubDate = parseDate(ldJson?.datePublished);
                item.updated = parseDate(ldJson?.dateModified);
                item.author = ldJson?.author.map((author) => author.name).join(', ');
                item.category = ldJson?.keywords.split(',');

                if (ldJson?.audio) {
                    item.itunes_item_image = ldJson.audio.thumbnailUrl;
                    // TODO: Use Temporal.Duration when https://tc39.es/proposal-temporal/ is GA
                    item.itunes_duration = ldJson.audio.duration
                        .match(/P0DT(\d+)H(\d+)M(\d+)S/)
                        .slice(1)
                        .map((x) => parseInt(x))
                        .reduce((a, b) => a * 60 + b);
                    item.enclosure_url = ldJson.audio.contentUrl;
                    item.enclosure_type = 'audio/mpeg';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        image: $('meta[property="og:image"]').attr('content'),
        icon: new URL($('link[rel="apple-touch-icon"]').attr('href'), currentUrl).href,
        logo: new URL($('link[rel="apple-touch-icon"]').attr('href'), currentUrl).href,
        item: items,
        language: $('html').attr('lang'),
    };
};
