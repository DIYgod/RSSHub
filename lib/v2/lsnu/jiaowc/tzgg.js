const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://jiaowc.lsnu.edu.cn/tzgg.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('tr[id^="line_u5_"]').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').attr('title');
            const link = 'http://jiaowc.lsnu.edu.cn/' + $('a').attr('href');
            const date = $('td[width="80"]').text();

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const articleData = response.data;
            const article$ = cheerio.load(articleData);
            const description = article$('.v_news_content').html();

            const single = {
                title,
                link,
                description,
                pubDate: new Date(date).toUTCString(),
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '乐山师范学院教学部通知公告',
        link: 'http://jiaowc.lsnu.edu.cn/tzgg.htm',
        item: out,
    };
};
