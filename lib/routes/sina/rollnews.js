const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got(`https://feed.mix.sina.com.cn/api/roll/get?pageid=372&lid=2431&k=&num=50&page=1&r=${Math.random()}&callback=&_=${new Date().getTime()}`, {
        headers: {
            Referer: 'https://tech.sina.com.cn/',
        },
    });
    const list = response.data.result.data;

    const out = await Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const date = data.intime * 1000;
            const link = data.url;

            const description = await ctx.cache.tryGet(`sina-rollnews: ${link}`, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);

                return $('.article').html();
            });

            const single = {
                title,
                link,
                description,
                pubDate: parseDate(date),
            };
            return single;
        })
    );

    ctx.state.data = {
        title: '新浪科技滚动新闻',
        link: 'https://tech.sina.com.cn/roll/rollnews.shtml#pageid=372&lid=2431&k=&num=50&page=1',
        item: out,
    };
};
