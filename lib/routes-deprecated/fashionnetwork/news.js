const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const country = ctx.params.country || 'ww';
    let sectors = ctx.params.sectors || '';
    let categories = ctx.params.categories || '';

    sectors = sectors === 'all' ? '' : sectors;
    categories = categories === 'all' ? '' : categories;

    const sectorsUrl = sectors ? 'sectors%5B%5D=' + sectors.split(',').join('&sectors%5B%5D=') : '';
    const categoriesUrl = categories ? 'categs%5B%5D=' + categories.split(',').join('&categs%5B%5D=') : '';

    if (!isValidHost(country)) {
        throw new Error('Invalid country');
    }

    const rootUrl = `https://${country}.fashionnetwork.com`;
    const currentUrl = `${rootUrl}/news/s.jsonp?${sectorsUrl}&${categoriesUrl}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(
        unescape(response.data.match(/"html":"(.*)","relatedUrl"/)[1].replaceAll(/\\(u[\dA-Fa-f]{4})/gm, '%$1'))
            .replaceAll('\\n', '')
            .replaceAll('\\/', '/')
    );

    const list = $('.list-ui__title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: Date.parse(item.parent().find('time').attr('datetime')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('.newsTitle, .ads').remove();

                item.description = content('div[itemprop="text"]').html();

                return item;
            })
        )
    );

    const labels = [];

    $('.filter__label').each(function () {
        labels.push($(this).text());
    });

    ctx.state.data = {
        title: `${labels.join(',') || 'All'} - FashionNetwork`,
        link: `${rootUrl}/news/s?${sectorsUrl}&${categoriesUrl}`,
        item: items,
    };
};
