const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let response = await got({
        method: 'get',
        url: 'https://ak.hypergryph.com/news.html',
    });

    let newslist = response.data;

    const $ = cheerio.load(newslist);
    newslist = $('#news > div > div.news-block > ul:first-child > li');
    newslist = newslist
        .map((index, item) => {
            const sth = $(item);
            return {
                title: sth
                    .find('.news-title')
                    .first()
                    .text(),
                description: `aaa`,
                link: `https://ak.hypergryph.com${sth
                    .find('a')
                    .attr('href')
                    .slice(1)}`,
                pubDate: new Date(
                    sth
                        .find('.news-date-text')
                        .first()
                        .text()
                ),
            };
        })
        .get();

    for (const i in newslist) {
        response = await got({
            method: 'get',
            url: newslist[i].link,
        });
        let content = response.data;
        content = cheerio.load(content);
        content = content('.article-inner > p');
        newslist[i].description = content;
    }

    ctx.state.data = {
        title: '《明日方舟》游戏公告与新闻',
        link: 'https://ak.hypergryph.com/news.html',
        item: newslist,
    };
};
