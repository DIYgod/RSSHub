const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'night';

    const options = {
        daily: {
            title: '每日聚焦',
            suffix: '/category/daily',
        },
        pcz: {
            title: '最好玩',
            suffix: '/category/pcz',
        },
        night: {
            title: '触乐夜话',
            suffix: '/tag/index/id/20369.html',
        },
        news: {
            title: '动态资讯',
            suffix: '/category/zsyx',
        },
    };

    const response = await got.get(`https://www.chuapp.com${options[category].suffix}`);
    const $ = cheerio.load(response.data);

    const articles = $('a.fn-clear')
        .map((index, ele) => ({
            title: $(ele).attr('title'),
            link: $(ele).attr('href'),
        }))
        .get();

    const item = await Promise.all(
        articles.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got.get(`http://www.chuapp.com${item.link}`);
                    const s = cheerio.load(res.data);
                    item.description = s('.content .the-content').html();
                    item.pubDate = new Date(s('.friendly_time').attr('data-time'));
                    item.author = s('.author-time .fn-left').text();
                    return Promise.resolve(item);
                })
        )
    );

    ctx.state.data = {
        title: `触乐 - ${options[category].title}`,
        link: `https://www.chuapp.com${options[category].suffix}`,
        item,
    };
};
