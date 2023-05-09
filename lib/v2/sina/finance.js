const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://feed.sina.com.cn/api/roll/get?pageid=155&lid=1686&num=20&versionNumber=1.2.8&page=1&encode=utf-8';
    const response = await got.get(url);
    const list = response.data.result.data;

    const out = await Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const date = data.intime * 1000;
            const link = data.url;

            const description = await ctx.cache.tryGet(`sina-finance: ${link}`, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);

                return $('#artibody').html();
            });

            const single = {
                title,
                link,
                description,
                pubDate: new Date(date).toUTCString(),
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '新浪财经－国內',
        link: 'http://finance.sina.com.cn/china/',
        item: out,
    };
};
