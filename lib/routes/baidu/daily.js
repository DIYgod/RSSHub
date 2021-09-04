const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const host = `https://zhidao.baidu.com/daily?fr=daohang`;

    const response = await got.get(host, {
        responseType: 'buffer',
    });

    response.data = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(response.data);

    const list = $("li[class=' clearfix']").get();

    const items = list.map((item) => {
        item = $(item);

        return {
            title: item.find('div.daily-cont-top > h2 > a').text(),
            description: item.find('div.daily-cont-top > div > a').text(),
            link: `https://zhidao.baidu.com/${item.find('div.daily-cont-top > h2 > a').attr('href')}`,
        };
    });

    const result = await Promise.all(
        items.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link, {
                responseType: 'buffer',
            });
            const data = iconv.decode(itemReponse.data, 'gbk');
            const itemElement = cheerio.load(data);

            item.description = itemElement('.detail-wp').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `知道日报`,
        link: host,
        description: `每天都知道一点`,
        item: result,
    };
};
