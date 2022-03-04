const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'bkszs';

    const rootUrl = 'https://dky.sicau.edu.cn';
    const currentUrl = `${rootUrl}/zsjy/${category}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('a.tit')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                pubDate: parseDate(item.prev().text()),
                link: `${rootUrl}${item.attr('href').replace(/\.\./, '/')}`,
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

                content('.v_news_content p').slice(0, 2).remove();

                item.description = content('.v_news_content').html();

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
