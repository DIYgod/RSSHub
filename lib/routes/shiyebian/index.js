const got = require('@/utils/got');
const cheerio = require('cheerio');
const Iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const province = ctx.params.province;
    const city = ctx.params.city || "";
    const url = `http://www.shiyebian.net/${province}/${city}/index.html`;
    const response = await got({
        method: 'get',
        url: url,
        responseType: 'buffer',
    });

    const $ = cheerio.load(Iconv.decode(response.data, 'gb2312'));

    const Itemlist = $('ul[class=lie1]').children().map(
        (_, item) => {
            item = $(item);
            return {
                link: item.find("a").attr("href"),
                title: item.find("a").text(),
                pubDate: new Date(item.find("a").text().slice(0,4) + "-" + item.find("em").text()).toUTCString(),
                description: "",
            };
        }
    ).get();

    let items = await Promise.all(
        Itemlist.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });
                    const content = cheerio.load(Iconv.decode(detailResponse.data, "gb2312"));
                    item.description = content('div[class=zhengwen]').html();

                    return item;
                })
        )
    );
    items = items.sort();
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: item.pubDate,
            link: item.link,
        })
        ),
    };
};
