const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.csail.mit.edu';
    const currentUrl = `${rootUrl}/news`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.featured-person').remove();

    const list = $('article[role="article"]')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                link: `${rootUrl}${item.attr('about')}`,
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

                content('.sidebar-right, .sidebar-item').remove();

                item.title = content('.page-title').text();
                item.description = content('.content-container-inner').html();
                item.pubDate = new Date(content('time').attr('datetime')).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'News - MIT CSAIL',
        link: currentUrl,
        item: items,
    };
};
