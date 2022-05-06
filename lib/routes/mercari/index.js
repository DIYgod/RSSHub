const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.type = ctx.params.type === 'search' ? ctx.params.type + '/?keyword=' : ctx.params.type + '/';

    const rootUrl = 'https://www.mercari.com';
    const currentUrl = `${rootUrl}/jp/${ctx.params.type}${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let list;
    if (ctx.params.type === 'category/') {
        list = JSON.parse(response.data.match(/"searchCategory":(.*?),"crossBorderBanner/)[1])
            .data.slice(0, 10)
            .map((item) => ({
                title: item.name,
                link: `${rootUrl}/jp/items/${item.id}/`,
            }));
    } else {
        list = $('section.items-box')
            .slice(0, 10)
            .map((_, item) => {
                item = $(item);
                return {
                    title: item.find('h3.items-box-name').text(),
                    link: `${rootUrl}${item.find('a').attr('href')}`,
                };
            })
            .get();
    }

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('div.item-btn-float-area').remove();
                    content('div.owl-nav').remove();
                    content('div.owl-dots').remove();

                    item.description = content('div.item-main-content').html();

                    return item;
                } catch (e) {
                    return Promise.resolve('');
                }
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
