const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://bioone.org';
    const response = await got(rootUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    let items = $('.items h4 a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.attr('href').split('?')[0];

            return {
                title: item.text(),
                link: !link.includes('http') ? `${rootUrl}${link}` : link,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('#divARTICLECONTENTTop').html();
                item.doi = content('meta[name="dc.Identifier"]').attr('content');
                item.pubDate = parseDate(content('meta[name="dc.Date"]').attr('content'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Featured articles - BioOne',
        link: rootUrl,
        item: items,
    };
};
