const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'Politics';
    const path = category === 'Science,Technology' ? 'condition4' : 'category_code';
    const res = await got.get(`https://www.nippon.com/api/search/cn/${path}/20/1/${category}?t=${Date.now()}`);

    const list = res.data.body.dataList.map((item) => ({
        title: item.title,
        link: `https://www.nippon.com/${item.pub_url}`,
        pubDate: item.pub_date,
    }));

    const item = await Promise.all(
        list.slice(0, 10).map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                const $ = cheerio.load(res.data);
                item.description = $('.editArea').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `走进日本 - ${category}`,
        link: 'https://www.nippon.com/cn/economy/',
        item,
    };
};
