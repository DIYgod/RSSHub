const got = require('@/utils/got');
const url = require('url');
const cheerio = require('cheerio');

const supportedList = require('./supportedList');

module.exports = async (ctx) => {
    const country = ctx.params.country;
    const city = ctx.params.city || undefined;

    let config = supportedList[country.toLowerCase()];
    let desc;

    if (city === undefined) {
        desc = `中国驻${config.countryCN}大使馆 -- 重要通知`;
    } else {
        config = config.consulates[city.toLowerCase()];
        desc = `中国驻${config.cityCN}领事馆 -- 重要通知`;
    }

    const link = config.link;
    const hostname = url.parse(link).hostname;

    const res = await got.get(link);
    const $ = cheerio.load(res.data);

    const list = [];

    $(config.list)
        .slice(0, 10)
        .each((i, e) => {
            const temp = url.resolve(link, $(e).attr('href'));
            if (url.parse(temp).hostname === hostname) {
                list.push(temp);
            }
        });

    const out = await Promise.all(
        list.map(async (link) => {
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(link);
            const $ = cheerio.load(response.data);
            const single = {
                title: $(config.title).text(),
                link,
                description: $(config.description).html(),
                pubDate: new Date($(config.pubDate).text().replace('(', '').replace(')', '')).toUTCString(),
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: desc,
        description: desc,
        link,
        item: out,
    };
};
