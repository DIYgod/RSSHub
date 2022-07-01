const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.tam.museum';
    const currentUrl = `${rootUrl}/astronomy/forecast.php?lang=tw`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('#sample_2 a[title]')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}/astronomy/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.content_detail').html();
                item.pubDate = new Date(detailResponse.data.match(/<label>公告日期 : <\/label> (\d{4}-\d{2}-\d{2})/)[1]).toUTCString();

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
