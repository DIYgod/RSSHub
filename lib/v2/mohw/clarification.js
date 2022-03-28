const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.mohw.gov.tw';
    const currentUrl = `${rootUrl}/lp-17-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list01 a[title]')
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

                item.description = content('article').html();
                item.pubDate = parseDate(content('meta[name="DC.Date"]').attr('datetime'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '即時新聞澄清 - 台灣衛生福利部',
        link: currentUrl,
        item: items,
    };
};
