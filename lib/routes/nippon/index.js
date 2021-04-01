const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'Politics';
    const res = await got.get(`https://www.nippon.com/api/search/cn/category_code/20/1/${category}?t=${Date.now}`);

    const list = res.data.body.dataList.map((item) => ({
        title: item.title,
        link: `https://www.nippon.com/${item.pub_url}`,
        pubDate: item.pub_date,
    }));

    const item = await Promise.all(
        list.slice(0, 1).map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got.get(item.link);
                    const $ = cheerio.load(res.data);
                    item.description = $('.editArea').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '走进日本',
        link: 'https://www.nippon.com/cn/economy/',
        item,
    };
};
