const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.cat = ctx.params.cat ? '/cat_' + ctx.params.cat : '';

    const shopUrl = `http://shop.kongfz.com/${ctx.params.id}${ctx.params.cat}`;

    const shopResponse = await got({
        method: 'get',
        url: shopUrl,
    });

    const $ = cheerio.load(shopResponse.data);

    const list = $(ctx.params.cat ? 'div.list-content div.item-row' : 'div.newest_content span.rareBook_content_list')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = ctx.params.cat ? item.find('a').eq(0) : item.find('div.rareBook_content_title a');
            return {
                title: item.text(),
                link: a.attr('href'),
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

                    content('#eventreport').remove();
                    content('div.buy-group').remove();
                    content('div.weixin-popup-bg').remove();

                    const imgHtml = `<img src="${content('ul.lg-list li img').attr('src')}">`;

                    item.description = content('div.major-function').html() + imgHtml;
                    item.pubDate = new Date(content('span.up-book-date-time').text());

                    return item;
                })
        )
    );

    const titleSplit = $('title').text().split('_');

    ctx.state.data = {
        title: `孔夫子旧书网 - ${titleSplit[titleSplit.length - 2]}`,
        link: shopUrl,
        item: items,
    };
};
