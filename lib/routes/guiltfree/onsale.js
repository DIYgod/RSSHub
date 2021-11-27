const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'https://www.guiltfree.pl/pl/onsale';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('#prodlistx ul li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.product-name');
            return {
                title: item.find('span.name_list').text(),
                link: a.attr('href'),
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

                content('.cartqtyrow').remove();
                content('#accessoriesblock').remove();
                content('#crossselling_block').remove();

                item.description = content('#center_column').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Guiltfree.pl - Wyprzedaże',
        link: currentUrl,
        item: items,
    };
};
