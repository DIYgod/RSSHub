const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `http://www.szse.cn/lawrules/rule/new/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.newslist li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const s = item.find('script').html();
            return {
                title: s.match(/var curTitle ='(.*?)';/)[1],
                link: `http://www.szse.cn/lawrules/rule${s.match(/var curHref = '..(.*?)';/)[1]}`,
                pubDate: new Date(item.find('span.time').text().trim()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('#desContent').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '深圳证券交易所 - 最新规则',
        link: currentUrl,
        item: items,
    };
};
