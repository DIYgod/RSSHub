const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || '';

    const rootUrl = 'https://www.uisdc.com';
    const currentUrl = `${rootUrl}/category/hangye${caty === '' ? '' : '/' + caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.item-div a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
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

                item.title = content('#post_title').text();
                item.description = content('.article').html();
                item.pubDate = new Date(content('.time').attr('title')).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.current').text()} - 优设网 - UISDC`,
        link: currentUrl,
        item: items,
    };
};
