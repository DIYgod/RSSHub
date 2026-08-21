const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const sort = ctx.params.sort || '';

    const rootUrl = 'https://community.naceweb.org';
    const currentUrl = `${rootUrl}/browse/blogs/${sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.BlogTitle')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');
            const split = link.split('/');

            return {
                link,
                title: item.text(),
                pubDate: new Date(`${split[5]}-${split[6]}-${split[7]}`).toUTCString(),
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

                item.description = content('.blogs-block .col-md-12').html();

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
