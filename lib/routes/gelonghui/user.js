const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.gelonghui.com/user/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('section.item')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const h = item.find('h2');
            const pubDate = item.find('p').text();
            return {
                title: h.text(),
                link: url.resolve(`https://www.gelonghui.com`, h.parent().attr('href')),
                pubDate: new Date(
                    pubDate.substr(pubDate.length - 1, 1) !== '分' ? new Date().getFullYear() + '-' + pubDate : pubDate.replace('年', '-').replace('月', '-').replace('日', ' ').replace('时', ':').replace('分', '')
                ).toUTCString(),
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
        title: `格隆汇 - 用户 ${$('p.nick').text()} 的文章`,
        link: currentUrl,
        item: items,
        description: $('div.val').text(),
    };
};
