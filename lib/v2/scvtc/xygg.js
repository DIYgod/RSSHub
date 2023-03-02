const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const currentUrl = 'https://www.scvtc.edu.cn/ggfw1/xygg.htm';
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const list = $('div.text-list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: parseDate(item.find('span').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('#vsb_content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        decription: $('meta[name=description]').attr('content'),
        link: currentUrl,
        item: items,
    };
};
