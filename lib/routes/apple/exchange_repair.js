import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const host = 'https://support.apple.com/';

export default async (ctx) => {
    const {
        country = ''
    } = ctx.params;
    const link = url.resolve(host, `${country}/exchange_repair/`);

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('section.as-columns').get().slice(0, 5);

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.icon-chevronright').parent();
            const itemUrl = url.resolve(host, $a.attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(itemUrl);
            const $$ = cheerio.load(response.data);
            const description = $$('.main').html();

            const single = {
                title: $a.text(),
                link: itemUrl,
                author: 'Apple Inc.',
                description,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: `Apple - ${$('.main>.richText h1').text()}`,
        link,
        item: out,
    };
};
