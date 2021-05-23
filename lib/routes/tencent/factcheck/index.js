const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://vp.fact.qq.com/loadmore?artnum=0&page=0',
        headers: {
            Referer: 'https://vp.fact.qq.com/home',
        },
    });

    const data = response.data.content;

    const items = await Promise.all(
        (data || []).map(async (item) => {
            const link = `https://vp.fact.qq.com/article?id=${item.id}`;
            const simple = {
                title: `【${item.explain}】${item.title}`,
                description: `<img src="${item.cover}">${item.abstract}`,
                pubDate: new Date(item.date).toUTCString(),
                author: `${item.author}${item.author !== item.authordesc ? '-' + item.authordesc : ''}`,
                link: link,
            };

            const details = await ctx.cache.tryGet(link, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);
                return {
                    description: `<img src="${item.cover}"><br>查证要点：${$('.check_content_points').html()}<br>${$('.check_content_writer').html()}`,
                };
            });
            return Promise.resolve(Object.assign({}, simple, details));
        })
    );

    ctx.state.data = {
        title: '较真查证平台-腾讯新闻',
        link: 'https://vp.fact.qq.com/home',
        item: items,
    };
};
