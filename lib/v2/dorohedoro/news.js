const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 25;

    const rootUrl = 'https://dorohedoro.net';
    const apiUrl = `${rootUrl}/news/news.xml`;
    const currentUrl = `${rootUrl}/news/`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = cheerio.load(response.data, {
        xmlMode: true,
    });

    let items = $('item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.find('permalink').text();
            const isNews = /news_\d+_\d+\.html/.test(link);

            return {
                title: item.find('title').text(),
                pubDate: parseDate(item.find('date').text()),
                link: `${rootUrl}${isNews ? `/news/${link}` : ''}`,
                isNews,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.isNews) {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });

                        const content = cheerio.load(detailResponse.data);

                        content('#bk_btn').remove();

                        item.title = content('.newsTitle').text();
                        item.description = content('article').html();
                    } catch (e) {
                        // no-empty
                    }
                }

                delete item.isNews;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'アニメ『ドロヘドロ』',
        link: currentUrl,
        item: items,
    };
};
