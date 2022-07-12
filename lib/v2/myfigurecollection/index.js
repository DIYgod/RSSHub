const got = require('@/utils/got');
const cheerio = require('cheerio');

const shortcuts = {
    potd: 'picture/browse/potd',
    potw: 'picture/browse/potw',
    potm: 'picture/browse/potm',
};

module.exports = async (ctx) => {
    const language = ctx.params.language ?? '';
    const category = ctx.params.category ?? 'figure';

    const rootUrl = `https://${language === 'en' || language === '' ? '' : `${language}.`}myfigurecollection.net`;
    const currentUrl = `${rootUrl}/${shortcuts.hasOwnProperty(category) ? shortcuts[category] : category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.item-icon, .picture-icon')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('a');

            const link = item.attr('href');

            return {
                link: /^http/.test(link) ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.title = content('.headline').text();
                item.description = content('.main, .the-picture').html() + (content('.form').html() || '');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/ \(.*\)/, ''),
        link: currentUrl,
        item: items,
    };
};
