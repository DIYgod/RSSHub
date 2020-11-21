const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await got({
        url: 'https://data.163.com',
        method: 'get',
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const dataStr = $('*')
        .html()
        .match(/var\sohnofuchlist=\[(.|\n)*"a"\];$/gm)[0];
    const arr = new Function(dataStr + 'ohnofuchlist.pop();return ohnofuchlist;')();

    const item = await Promise.all(
        arr.slice(0, 20).map(async (item) => {
            const single = await ctx.cache.tryGet(item.url, async () => {
                const res = await got.get(item.url);
                const doc = cheerio.load(res.data);
                const description = doc('#main-content').html() || doc('.post_body').html();
                return {
                    title: item.title,
                    link: item.url,
                    pubDate: new Date(item.time),
                    description,
                };
            });
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '数读 - 网易新闻',
        link: 'https://data.163.com/',
        item,
    };
};
