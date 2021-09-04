const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = `https://forum.gamer.com.tw/A.php?bsn=${ctx.params.bsn}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.FM-abox2A a.FM-abox2B')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: `https:${item.attr('href')}`,
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

                    content('div.c-post__body__buttonbar').remove();

                    item.title = content('.c-post__header__title').text();
                    item.description = content('div.c-post__body').html();
                    item.author = `${content('a.username').eq(0).text()} (${content('a.userid').eq(0).text()})`;
                    item.pubDate = new Date(content('a.edittime').eq(0).attr('data-mtime') + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
