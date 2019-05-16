const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios.get(`https://feed.mix.sina.com.cn/api/roll/get?pageid=372&lid=2431&k=&num=50&page=1&r=${Math.random()}&callback=&_=${new Date().getTime()}`);
    const list = response.data.result.data;

    const out = await Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const date = data.intime * 1000;
            const link = data.url;

            const description = await ctx.cache.tryGet(`sina-rollnews: ${link}`, async () => {
                const response = await axios.get(link);
                const $ = cheerio.load(response.data);

                return $('.article').html();
            });

            const single = {
                title: title,
                link,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '新浪科技滚动新闻',
        link: 'https://tech.sina.com.cn/roll/rollnews.shtml#pageid=372&lid=2431&k=&num=50&page=1',
        item: out,
    };
};
