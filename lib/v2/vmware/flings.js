const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://flings.vmware.com';
    const currentUrl = `${rootUrl}/flings`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.clickable')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('.fling-title');
            const version = item.find('.fling-version').text();

            return {
                title: `${title.text()} (${version})`,
                link: `${rootUrl}${title.attr('href')}#${version}`,
                pubDate: parseDate(item.find('.date').text(), 'MMM DD, YYYY'),
                category: item
                    .find('.fling-tags a')
                    .toArray()
                    .map((a) => $(a).text()),
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

                content('#contributors, #similar-flings').remove();

                item.description = content('article').html();

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
