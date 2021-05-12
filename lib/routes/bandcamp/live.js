const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/live_schedule`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.curated-wrapper').remove();

    const list = $('.title-link')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
                title: item.children('.show-title').text(),
                author: item.children('.show-artist').text(),
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

                    content('.buy').remove();
                    content('.live-event-date-time').remove();

                    item.description = `<img src="${content('.main-art').attr('src')}">${content('.column.info').html()}`;

                    item.pubDate = date(detailResponse.data.match(/live_event_scheduled_start_date&quot;:&quot;(\d{2} [a-zA-Z]+ \d{4} \d{2}:\d{2}:\d{2} GMT)&quot/)[1]);

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
