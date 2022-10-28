const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '';

    const rootUrl = 'https://www.baijingapp.com';
    const currentUrl = `${rootUrl}/article${type ? `/type-${type}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.article')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.author = content('.name').text();
                item.description = content('#message').html();
                item.pubDate = timezone(parseDate(content('.timeago').text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `白鲸出海 - ${$('.list .active').text()}`,
        link: currentUrl,
        item: items,
    };
};
