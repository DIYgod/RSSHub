const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || '139';

    const rootUrl = 'http://wanwansub.com';
    const currentUrl = `${rootUrl}/node/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.pg-item a')
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
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.button').remove();

                    const links = detailResponse.data.match(/<a href="magnet:(.*?)" target="_self">磁力<\/a>/g);

                    if (links) {
                        item.enclosure_type = 'application/x-bittorrent';
                        item.enclosure_url = links.pop().match(/<a href="(.*)" target="_self">磁力<\/a>/)[1];
                    }

                    item.description = content('.content-box').html();

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
