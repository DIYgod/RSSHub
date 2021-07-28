const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://sspai.com/api/v1/series/tag/all/get');

    const products = response.data.data.reduce((acc, cate) => {
        if (Array.isArray(cate.children)) {
            const result = cate.children
                .filter((item) => item.sell_status)
                .map((item) => {
                    const price = item.price / 100;
                    return {
                        id: item.id,
                        title: `￥${price} - ${item.title}`,
                        link: `https://sspai.com/series/${item.id}`,
                        author: item.author.nickname,
                    };
                });
            return [...acc, ...result];
        } else {
            return acc;
        }
    }, []);

    const item = await Promise.all(
        products.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got.get(`https://sspai.com/api/v1/series/info/get?id=${item.id}&view=second`);
                    const banner = `<img src="https://cdn.sspai.com/${res.data.data.banner_web}" />`;
                    const description = banner + res.data.data.intro;
                    const $ = cheerio.load(description);
                    $('img').css('max-width', '100%');
                    item.description = $.html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '少数派 -- 最新上架付费专栏',
        link: 'https://sspai.com/series',
        description: '少数派 -- 最新上架付费专栏',
        item,
    };
};
