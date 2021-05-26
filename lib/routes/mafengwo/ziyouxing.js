const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = `http://www.mafengwo.cn/gonglve/ziyouxing/list/list_page?mddid=${ctx.params.code}&page=1`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data.html);
    const list = $('div.item')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: item.find('h3').text(),
                link: url.resolve(`http://www.mafengwo.cn`, a.attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.pubDate = new Date(content('span.time').eq(1).find('em').text()).toUTCString();
                    item.description = content('div.sideL').html();
                    return item;
                })
        )
    );

    const titleResponse = await got({
        method: 'get',
        url: `http://www.mafengwo.cn/gonglve/ziyouxing/mdd_${ctx.params.code}/`,
    });
    const title = cheerio.load(titleResponse.data);

    ctx.state.data = {
        title: title('title').text(),
        link: rootUrl,
        item: items,
    };
};
