const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id || 'bwzq';

    const rootUrl = 'http://news.ctei.cn';
    const currentUrl = `${rootUrl}/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.news_text ul li a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${currentUrl}${item.attr('href').replace(/\./, '')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.TRS_Editor').html();
                item.pubDate = parseDate(item.link.match(/\/t(\d{8})_\d+.htm/)[1], 'YYYYMMDD');

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
