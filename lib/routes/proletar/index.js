const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const id = ctx.params.id || '';

    const rootUrl = 'https://review.proletar.ink';
    const currentUrl = `${rootUrl}/${type === '' && id === '' ? 'posts' : `${type}/${id}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.archive-item-link')
        .slice(0, 15)
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

                    item.author = content('.post-author').text();
                    item.description = content('#content').html();
                    item.pubDate = new Date(detailResponse.data.match(/"datePublished":"(.*)","dateModified"/)[1]).toUTCString();

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
