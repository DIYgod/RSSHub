const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://news.neea.cn';
    const currentUrl = `${rootUrl}/JLPT/1/newslist.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a')
        .toArray()
        .map((item) => {
            item = $(item);

            const matches = item.text().match(/(\d{4}-\d{2}-\d{2})/);

            return {
                title: item.text(),
                link: `${rootUrl}/JLPT/1/${item.attr('href')}`,
                pubDate: matches ? parseDate(matches[1]) : '',
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

                item.description = content('.dvContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '重要通知 - 教育部考试中心日本语能力测试',
        link: currentUrl,
        item: items,
    };
};
