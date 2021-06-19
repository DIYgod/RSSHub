const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tag = ctx.params.tag || 'utools';
    const sort = ctx.params.sort || '';

    const rootUrl = 'https://yuanliao.info';
    const currentUrl = `${rootUrl}/api/discussions?tags=${tag}&sort=${sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.attributes.title,
        link: `${rootUrl}/d/${item.id}-${item.attributes.slug}`,
        pubDate: new Date(item.attributes.lastPostedAt).toUTCString(),
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('#flarum-content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${tag} - 猿料`,
        link: currentUrl,
        item: items,
    };
};
