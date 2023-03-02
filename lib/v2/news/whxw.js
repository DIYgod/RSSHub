const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.news.cn';
    const currentUrl = `${rootUrl}/whxw.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('h3 a')
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
                let detailResponse;

                try {
                    detailResponse = await got(item.link);
                } catch (error) {
                    item.status = 404;
                }

                if (item.status !== 404) {
                    const content = cheerio.load(detailResponse.data);
                    const date = content('.header-time.left').text() || content('.h-time').text() || content('.info').text();
                    const author =
                        content('.editor').text() ??
                        content('.p-jc')
                            .text()
                            .replace(/[\r\n]/g, '')
                            .replace('： ', ':')
                            .trim();

                    item.author = author.split(':').pop().replace('】', '');

                    content('#articleEdit').remove();

                    item.description = content('#detail').html();
                    item.pubDate = timezone(parseDate(date, date.includes('/') ? 'YYYYMM/DD HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss'), +8);
                }

                delete item.status;
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
