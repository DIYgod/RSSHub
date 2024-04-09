const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://rf.eefocus.com/article/list-all';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('h3.media-heading')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve('https://rf.eefocus.com/', a.attr('href')),
            };
        })
        .get();

    ctx.state.data = {
        title: 'RF技术社区 - 文章',
        link: rootUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.pubDate = new Date(content('div.article-subline-desc').eq(0).text().replace('发布时间：', '')).toUTCString();
                    item.description = content('div.clearfix.article-content').html();
                    return item;
                })
            )
        ),
    };
};
