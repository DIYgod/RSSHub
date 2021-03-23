const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://sites.google.com';
    const currentUrl = `${rootUrl}/site/${id}/system/app/pages/recentChanges`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#sites-recent-activity-wrapper .sites-clear .sites-table tbody tr')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.find('td').eq(1).text(),
                link: item.find('a').attr('href'),
                pubDate: date(item.find('td strong span').text()),
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

                    item.description = content('#sites-canvas').html();

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
