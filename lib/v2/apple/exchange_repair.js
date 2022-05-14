const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://support.apple.com/';

module.exports = async (ctx) => {
    const country = ctx.params.country ?? '';
    const link = new URL(`${country}/exchange_repair/`, host);

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('section.as-columns').get().slice(0, 5);

    const out = await Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);
            const $a = $('.icon-chevronright').parent();
            const itemUrl = new URL($a.attr('href'), host).href;

            return ctx.cache.tryGet(itemUrl, async () => {
                const response = await got.get(itemUrl);
                const $$ = cheerio.load(response.data);
                const description = $$('.main').html();

                return {
                    title: $a.text(),
                    link: itemUrl,
                    author: 'Apple Inc.',
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: `Apple - ${$('.main>.richText h1').text()}`,
        link,
        item: out,
    };
};
