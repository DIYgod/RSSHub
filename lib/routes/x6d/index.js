const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.x6d.com/html/${ctx.params.id}.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('i.rj').remove();

    const list = $('a.soft-title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `https://www.x6d.com/${item.attr('href')}`,
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

                    item.description = content('div.article-content').html();
                    item.pubDate = new Date(content('time').text() + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `小刀娱乐网 - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    };
};
