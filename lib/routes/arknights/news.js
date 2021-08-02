const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://ak.hypergryph.com/news.html',
    });

    let newslist = response.data;

    const $ = cheerio.load(newslist);
    newslist = $('.articleItem > .articleItemLink');

    newslist = await Promise.all(
        newslist
            .slice(0, 9) // limit article count to a single page
            .map(async (index, item) => {
                const sth = $(item);
                const link = `https://ak.hypergryph.com${sth.attr('href')}`;
                const description = await ctx.cache.tryGet(link, async () => {
                    const result = await got.get(link);
                    const $ = cheerio.load(result.data);
                    return $('.article-content').html();
                });
                return {
                    title: `[${sth.find('.articleItemCate').first().text()}] ${sth.find('.articleItemTitle').first().text()}`,
                    description,
                    link,
                    pubDate: new Date(sth.find('.articleItemDate').first().text()),
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
