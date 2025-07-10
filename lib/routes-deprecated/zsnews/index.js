const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.cateid = ctx.params.cateid || '35';

    const response = await got.get(`http://www.zsnews.cn/api/mobile/getlist.html?cateid=${ctx.params.cateid}`);

    const out = await Promise.all(
        response.data.map((item) =>
            ctx.cache.tryGet(item.url, async () => {
                try {
                    const res = await got.get(item.url);
                    const $ = cheerio.load(res.data);
                    item.description = $('.article-content').html();
                    item.pubDate = new Date($('.article-meta span').first().text().slice(5)).toUTCString();
                    item.link = item.url;
                    return item;
                } catch {
                    return '';
                }
            })
        )
    );

    ctx.state.data = {
        title: '中山新闻',
        link: 'https://www.zsnews.cn/',
        item: out,
    };
};
