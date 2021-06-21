const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.gelonghui.com/subject/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('#subject-article ul li')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const h = item.find('h2').length === 0 ? item.find('p') : item.find('h2');
            return {
                title: h.text(),
                link: h.parent().attr('href'),
                pubDate: new Date(item.find('span').eq(2).text()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);

                    item.description = content('article.article-with-html').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `格隆汇 - 主题 ${$('span.user-nick').text()} 的文章`,
        link: currentUrl,
        item: items,
        description: $('div.user-name').parent().children('p').text(),
    };
};
