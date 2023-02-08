const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://support.apple.com/';

module.exports = async (ctx) => {
    const country = ctx.params.country ?? '';
    const link = new URL(`${country}/service-programs/`, host);

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('section.as-container-column').get().slice(0, 5);

    const out = await Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);
            const $a = $('.icon-chevronright').parent();
            const itemUrl = new URL($a.attr('href'), host).href;

            return ctx.cache.tryGet(itemUrl, async () => {
                const response = await got.get(itemUrl);
                const $$ = cheerio.load(response.data);

                // delete input and dropdown elements
                $$('div.as-sn-lookup-wrapper').remove();
                $$('div.as-dropdown-wrapper').remove();
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
        title: `Apple - ${$('h1.as-center').text()}`,
        link,
        item: out,
    };
};
