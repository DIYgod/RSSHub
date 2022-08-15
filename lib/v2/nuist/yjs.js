const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const path = ctx.path === '/yjs/' ? 'index/tzgg' : ctx.path.replace(/^\/yjs\//, '');

    const rootUrl = 'https://yjs.nuist.edu.cn';
    const currentUrl = `${rootUrl}/${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.gridlinediv')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').last();

            return {
                title: a.text(),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: parseDate(item.next().text(), 'YYYY年MM月DD日'),
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

                const timeMatches = content('.bar')
                    .text()
                    .match(/(\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})/);

                item.description = content('.v_news_content').html();
                item.pubDate = timeMatches ? timezone(parseDate(timeMatches[1], 'YYYY年MM月DD日 HH:mm'), +8) : item.pubDate;

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
