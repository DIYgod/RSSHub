const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const baseUrl = 'http://youth.cqu.edu.cn/index/';
    const url = `http://youth.cqu.edu.cn/index/${category}.htm`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const links = $('div[class=nwes_list]') // nwes_list 原文如此
        .find('a[target=_blank]', 'ul[style]')
        .map((index, item) => ({
            title: item.attribs.title,
            link: baseUrl + item.attribs.href,
        }))
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

            const [dateText, authorText] = newsContent
                .find('div[align=center]')
                .text()
                .split(/\u00A0+/, 2); // \xA0+: &nbsp;

            item.pubDate = dateText.replace(/ /, 'T') + '+08:00';
            if (authorText && authorText.slice(0, 4) === '拟稿人：') {
                item.author = authorText.slice(4);
            }
            const newsText = newsContent.find('div[class=v_news_content]');
            const attedText = newsText.parent().nextAll().filter('ul[style="list-style-type:none;"]');
            item.description = newsText.html() + (newsContent.html(attedText).html() || '');

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
