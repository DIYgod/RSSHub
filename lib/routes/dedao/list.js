const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || '年度日更';
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

    const currentUrl = `${rootUrl}${listResponse.data.match(new RegExp('<span>' + caty + '<\\/span><a href="(.*)" rel="tag"><\\/a>'))[1].split('"')[0]}`;
    const currentResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(currentResponse.data);

    const list = $('.pro-info p a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                    content('.more-bt').remove();

                    item.description = content('.main-content-wrapper').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `得到 - ${caty}`,
        link: currentUrl,
        item: items,
    };
};
