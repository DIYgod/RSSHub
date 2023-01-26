const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.wuhan.gov.cn';
    const currentUrl = `${rootUrl}/sy/whyw/`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('.articleList li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('.time').text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('.view').html();
                item.author = content('meta[name=ContentSource]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('h2').text()} - 武汉市人民政府`,
        link: currentUrl,
        item: items,
    };
};
