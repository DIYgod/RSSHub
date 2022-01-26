const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = `https://cn.reuters.com/assets/jsonWireNews`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const list_item = data.headlines.map((item) => {
        const info = {
            title: item.headline,
            link: 'https://cn.reuters.com' + item.url,
            pubDate: date(item.formattedDate),
        };
        return info;
    });

    function getDescription(items) {
        return Promise.all(
            items.map(async (currentValue) => {
                currentValue.description = await ctx.cache.tryGet(currentValue.link, async () => {
                    const r = await got({
                        url: currentValue.link,
                        method: 'get',
                    });
                    const $ = cheerio.load(r.data);
                    return $('.StandardArticle_content').html();
                });
                return currentValue;
            })
        );
    }

    await getDescription(list_item).then(() => {
        ctx.state.data = {
            title: '路透社 - 实时资讯',
            link: `https://cn.reuters.com/theWire`,
            item: list_item,
        };
    });
};
