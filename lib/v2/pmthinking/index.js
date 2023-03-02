const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://pmthinking.com';
    const currentUrl = `${rootUrl}/wp-json/b2/v1/getModulePostList`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            index: 2,
            post_paged: 1,
        },
    });

    const $ = cheerio.load(response.data.data);

    let items = $('h2 a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.author = content('.post-user-name').text();
                item.pubDate = timezone(parseDate(content('time[itemprop="datePublished"]').attr('datetime')), +8);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('.post-style-4-top img').attr('src'),
                    description: content('.entry-content').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '产品沉思录 · Product Thinking',
        link: rootUrl,
        item: items,
    };
};
