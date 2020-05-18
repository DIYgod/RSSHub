const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://grs.dlmu.edu.cn/zsgz/${ctx.params.type}.htm`;
    const response = await got({ method: 'get', url: link });

    const $ = cheerio.load(response.data);
    const list = $('div.main_conRCb ul li')
        .map((_, item) => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: `http://grs.dlmu.edu.cn/` + a.attr('href').replace('..', ''),
                pubDate: new Date($(item).find('span').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: link,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(detailResponse.data);
                        item.description = content('div.main_conDiv').html();
                        return item;
                    })
            )
        ),
    };
};
