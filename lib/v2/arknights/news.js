const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

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
                item = $(item);
                const link = `https://ak.hypergryph.com${item.attr('href')}`;
                const description = await ctx.cache.tryGet(link, async () => {
                    const result = await got(link);
                    const $ = cheerio.load(result.data);
                    return $('.article-content').html();
                });
                return {
                    title: `[${item.find('.articleItemCate').first().text()}] ${item.find('.articleItemTitle').first().text()}`,
                    description,
                    link,
                    pubDate: parseDate(item.find('.articleItemDate').first().text()),
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
