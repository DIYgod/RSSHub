const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://ak.hypergryph.com/news.html',
    });

    let newslist = response.data;

    const $ = cheerio.load(newslist);
    newslist = $('#news > div > div.news-block > ul:first-child > li');

    newslist = await Promise.all(
        newslist
            .map(async (index, item) => {
                const sth = $(item);
                const link = `https://ak.hypergryph.com${sth.find('a').attr('href').slice(1)}`;
                const description = await ctx.cache.tryGet(link, async () => {
                    const result = await got.get(link);
                    const $ = cheerio.load(result.data);
                    return $('.article-inner').html();
                });
                return {
                    title: sth.find('.news-title').first().text(),
                    description,
                    link,
                    pubDate: new Date(sth.find('.news-date-text').first().text()),
                };
            })
            .get()
    );

    ctx.state.data = {
        title: '《明日方舟》游戏公告与新闻',
        link: 'https://ak.hypergryph.com/news.html',
        item: newslist,
    };
};
