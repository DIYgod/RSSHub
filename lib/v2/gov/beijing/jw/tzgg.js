const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://jw.beijing.gov.cn';
    const currentUrl = `${rootUrl}/tzgg`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.col-md a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /^http/.test(link) ? link : `${rootUrl}${link.replace(/^\./, '/tzgg')}`,
                pubDate: parseDate(item.parent().find('span').text()),
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

                const pubDate = content('meta[name="PubDate"]').attr('content');

                item.author = content('meta[name="ContentSource"]').attr('content');
                item.pubDate = pubDate ? timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8) : item.pubDate;
                item.description = content('.TRS_UEDITOR').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '北京市教育委员会 - 通知公告',
        link: currentUrl,
        item: items,
        description: $('meta[name="ColumnDescription"]').attr('content'),
    };
};
