const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.cscse.edu.cn';
    const currentUrl = `${rootUrl}/cscse/index/tzgg/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.news_list li a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${/^http/.test(link) ? '' : rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.next().text()),
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

                item.description = content('.zoom').html();
                item.author = content('meta[name="Author"]').attr('content');
                item.category = content('meta[name="Keywords"]').attr('content')?.split(',');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '中国留学网 - 通知公告',
        link: currentUrl,
        item: items,
    };
};
