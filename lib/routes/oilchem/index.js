const got = require('@/utils/got');
const cheerio = require('cheerio');
const routes = require('./routes');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const category = ctx.params.category || '';
    const subCategory = ctx.params.subCategory || '';

    const route = category === '' ? '' : `/${category}${subCategory === '' ? '' : `/${subCategory}`}`;

    const rootUrl = `https://${type === '' ? 'www' : 'list'}.oilchem.net`;
    const currentUrl = `${rootUrl}${type === '' ? '/1/' : type === 'list' ? route : `/${routes[`/${type}${route}`]}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list ul ul li a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('#content').html();
                    item.pubDate = parseDate(content('meta[name="publishTime"]').attr('content'));

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('.hdbox h3').text()} - 隆众资讯`,
        link: currentUrl,
        item: items,
    };
};
