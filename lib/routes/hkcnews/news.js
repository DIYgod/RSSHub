const got = require('@/utils/got');
const cheerio = require('cheerio');

const titles = {
    '': '眾聞',
    13: '經濟',
    15: '社會',
    14: '生活',
    12: '政治',
    16: '國際',
    20: '台灣',
    21: '人物',
    19: '中國',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.hkcnews.com';
    const apiUrl = `${rootUrl}/data/newsposts${category === '' ? '' : `/${category}`}?page=1`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.items.map((item) => {
        const $ = cheerio.load(item);
        const news = $('.article-block-body a');
        const date = $('.line').eq(1).text().split('.').reverse().join('-');

        return {
            title: news.text(),
            link: `${rootUrl}/${news.attr('href')}`,
            pubDate: new Date(date.length === 8 ? `${new Date().getFullYear().toString().slice(0, 2)}${date}` : date).toUTCString(),
        };
    });

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.article-content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `眾新聞 - ${titles[category]}`,
        link: `${rootUrl}/news${category === '' ? '' : `/${category}/${titles[category]}`}`,
        item: items,
    };
};
