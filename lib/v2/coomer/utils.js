const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx, currentUrl) => {
    const rootUrl = 'https://coomer.party';
    currentUrl = `${rootUrl}/${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.post-card__link .fancy-link')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
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

                content('.ad-container').remove();

                item.author = content('.post__user-name').text();
                item.title = content('.post__title span').first().text();
                item.pubDate = parseDate(content('.timestamp').attr('datetime'));
                item.description = content('.post__body').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
