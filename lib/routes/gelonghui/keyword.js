const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.gelonghui.com/api/search/post?keyword=${ctx.params.keyword}&count=20&page=1&type=all`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = response.data.result.postList.map((item) => ({
        title: item.title,
        link: `https://www.gelonghui.com/p/${item.id}`,
        pubDate: new Date(item.createDate).toUTCString(),
    }));

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
        title: `格隆汇 - 关键词 “${ctx.params.keyword}” 的文章`,
        link: currentUrl,
        item: items,
        description: $('p.search-number').text(),
    };
};
