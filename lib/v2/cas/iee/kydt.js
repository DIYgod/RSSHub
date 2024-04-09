const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.iee.cas.cn/xwzx/kydt/';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('li.entry .entry-content-title')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.article-content').html();
                item.pubDate = timezone(parseDate(content('time').text().split('：')[1]), 8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '科研成果 - 中国科学院电工研究所',
        link: rootUrl,
        item: items,
    };
};
