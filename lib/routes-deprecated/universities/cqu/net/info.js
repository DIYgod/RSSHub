const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const baseUrl = `http://net.cqu.edu.cn/index/`;
    const url = `http://net.cqu.edu.cn/index/${category}.htm`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const links = $('li[id]', 'div[class=index]')
        .find('p[class=detail]', 'a[href]')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: baseUrl + item.parent().attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        [...links].map(async ({ title, link }) => {
            const item = {
                title,
                link,
            };
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }
            const response = await got({
                method: 'get',
                url: link,
            });
            const newsContent = cheerio.load(response.data)('form[name=_newscontent_fromname]');
            const dateP = newsContent.find('h1', 'div[class=cont]').nextAll().filter('p');

            const date = dateP.text().match(/日期：(\d{4})年(\d\d)月(\d\d)日/);
            item.pubDate = `${date[1]}-${date[2]}-${date[3]}T00:00+08:00`;
            item.description = newsContent.find('div[class=v_news_content]', 'div[class=contentd]').html();

            ctx.cache.set(item.link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $.title,
        item: items.filter(Boolean),
    };
};
