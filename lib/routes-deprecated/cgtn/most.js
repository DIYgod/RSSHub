const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.type = ctx.params.type || 'read';
    ctx.params.time = ctx.params.time || 'all';

    const rootUrl = `https://www.cgtn.com/most-${ctx.params.type}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $(`#${ctx.params.time}Items div.most-read-item-box div.cg-title`)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(Number.parseInt(a.attr('data-time'))).toUTCString(),
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

                item.description = content('#cmsMainContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `CGTN - Most ${ctx.params.type}`,
        link: rootUrl,
        item: items,
    };
};
