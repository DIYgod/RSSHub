const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const baseUrl = 'http://sci.cqu.edu.cn/';
    const url = `http://sci.cqu.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${category}`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const links = $('div[class=subcontent]')
        .find('a[target=_blank]', 'ul[class=subNewsList]')
        .map((index, item) => ({
            title: item.attribs.title,
            link: baseUrl + item.attribs.href,
        }))
        .get();

    const items = await Promise.all(
        [...links].map(async ({ title, link }) => {
            const item = {
                title: title,
                link: link,
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

            const [dateText] = newsContent.find('div[align=center]').text().split(/\xA0+/, 1); // \xA0+: &nbsp;

            item.pubDate = dateText.replace(/ /, 'T') + '+08:00';
            const newsText = newsContent.find('div[class=v_news_content]');
            const attedText = newsText.parent().nextAll().filter('ul[style="list-style-type:none;"]');
            item.description = newsText.html() + (newsContent.html(attedText).html() || '');

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $.title,
        item: items.filter((x) => x),
    };
};
