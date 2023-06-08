const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const rootUrl = 'https://news.futunn.com';
    const currentUrl = `${rootUrl}/main`;
    const apiUrl = `${rootUrl}/news-site-api/main/get-market-list?size=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        link: item.url.split('?')[0],
        author: item.source,
        pubDate: parseDate(item.timestamp * 1000),
        description: art(path.join(__dirname, 'templates/description.art'), {
            abs: item.abs,
            pic: item.pic,
        }),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (/news\.futunn\.com/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('.futu-news-time-stamp').remove();
                    content('.nnstock').each(function () {
                        content(this).replaceWith(`<a href="${content(this).attr('href')}">${content(this).text().replace(/\$/g, '')}</a>`);
                    });

                    item.description = content('.origin_content').html();
                    item.category = [
                        ...content('.news__from-topic__title')
                            .toArray()
                            .map((a) => content(a).text()),
                        ...content('#relatedStockWeb .stock-name')
                            .toArray()
                            .map((s) => content(s).text().trim()),
                    ];
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Futubull - Headlines',
        link: currentUrl,
        item: items,
    };
};
