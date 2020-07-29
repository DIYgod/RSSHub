const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://bgm.tv/user/${ctx.params.id}/blog`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('#entry_list div.item')
        .find('h2.title')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(`https://bgm.tv/`, a.attr('href')),
                pubDate: new Date(item.parent().find('small.time').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);

                    item.description = content('#entry_content').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
