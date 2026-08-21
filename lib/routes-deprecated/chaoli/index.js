const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const channel = ctx.params.channel || 'all';

    const rootUrl = 'https://chaoli.club';
    const currentUrl = `${rootUrl}/index.php/conversations/${channel}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.title a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.author = content('.info h3').eq(0).text();
                item.description = content('.postBody').eq(0).html();
                item.pubDate = new Date(Number.parseInt(content('.info .time').attr('data-timestamp')) * 1000).toUTCString();

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
