const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '年度日更';

    const rootUrl = 'https://www.igetget.com';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const listUrl = `${rootUrl}${response.data.match(new RegExp('<a href="(.*)">年度日更<\\/a>'))[1]}`;

    const listResponse = await got({
        method: 'get',
        url: listUrl,
    });

    const currentUrl = `${rootUrl}${listResponse.data.match(new RegExp('<span>' + category + '<\\/span><a href="(.*)" rel="tag"><\\/a>'))[1].split('"')[0]}`;

    const currentResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(currentResponse.data);

    let items = $('.pro-info p a')
        .toArray()
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                content('.more-bt').remove();

                item.description = content('.main-content-wrapper').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `得到 - ${category}`,
        link: currentUrl,
        item: items,
    };
};
