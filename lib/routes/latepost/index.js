const got = require('@/utils/got');
const cheerio = require('cheerio');

const titles = {
    '': '首页',
    1: '晚点独家',
    2: '人物访谈',
    3: '晚点早知道',
    4: '长报道',
};

module.exports = async (ctx) => {
    const proma = ctx.params.proma || '';

    const rootUrl = 'https://www.latepost.com';
    const apiUrl = `${rootUrl}${proma === '' ? '/site/index' : '/news/get-news-data'}`;
    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            page: 1,
            limit: 10,
            proma: proma,
        },
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}${item.detail_url}`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('#select-main').html();
                    item.pubDate = new Date(detailResponse.data.match(/release_time= '(\d{4}\/\d{2}\/\d{2})'/)[1]);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${titles[proma]} - 晚点`,
        link: rootUrl,
        item: items,
    };
};
