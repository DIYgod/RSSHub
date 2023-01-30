const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const currentUrl = `${rootUrl}/blogs${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().attr('href')}`,
                guid: `https://18comic.org${item.parent().attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.pubDate = parseDate(content('.date').first().text());

                content('.d-flex').remove();

                item.author = content('.blog_name_id').first().text();
                item.description = content('.blog_content').html();
                item.category = content('.panel-heading dropdown-toggle')
                    .toArray()
                    .map((c) => $(c).text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/最新的/, $('.article-nav .active').text()),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
    };
};
