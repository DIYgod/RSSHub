const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://gradadmissions.mit.edu';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const name = ctx.params.name;

    let link = host + '';
    switch (type) {
        case 'index':
            link = host + '/blog';
            break;
        case 'category':
            link = host + `/blog/browse/category/${name}`;
            break;
        case 'department':
            link = host + `/blog/browse/department/${name}`;
            break;
    }
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('#page-title').text();
    const list = $('div.views-row');
    const out = await Promise.all(
        list
            .slice(0, 10)
            .map(async (_, elem) => {
                const $elem = $(elem);

                const title = $elem.find('h3.item-title a').text() + '-' + $elem.find('h4.item-subtitle').text();
                const itemUrl = host + $elem.find('h3.item-title a').attr('href');
                const author = $elem.find('div.item-info a').text();

                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return JSON.parse(cache);
                }

                const response = await got.get(itemUrl);
                const $$ = cheerio.load(response.data);
                const description = $$('div.field-name-body div.field-items').html().replaceAll('src="', `src="${host}`);

                const single = {
                    title,
                    link: itemUrl,
                    author,
                    description,
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return single;
            })
            .get()
    );

    ctx.state.data = {
        title: `${title}-MIT`,
        link,
        item: out,
    };
};
