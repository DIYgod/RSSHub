const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const supportedList = require('./supportedList');

module.exports = async (ctx) => {
    const country = ctx.params.country;
    const city = ctx.params.city ?? undefined;

    let config = supportedList[country.toLowerCase()];
    let desc;

    if (city === undefined) {
        desc = `中国驻${config.countryCN}大使馆 -- 重要通知`;
    } else {
        config = config.consulates[city.toLowerCase()];
        desc = `中国驻${config.cityCN}领事馆 -- 重要通知`;
    }

    const link = config.link;
    const hostname = new URL(link).hostname;

    const res = await got(link);
    const $ = cheerio.load(res.data);

    const list = [];

    $(config.list)
        .slice(0, 10)
        .each((i, e) => {
            const temp = new URL($(e).attr('href'), link);
            if (temp.hostname === hostname) {
                list.push(temp);
            }
        });

    const out = await Promise.all(
        list.map((link) =>
            ctx.cache.tryGet(link.href, async () => {
                const response = await got(link);
                const $ = cheerio.load(response.data);
                const single = {
                    title: $(config.title).text(),
                    link,
                    description: $(config.description).html(),
                    pubDate: parseDate($(config.pubDate).text().replace('(', '').replace(')', '')),
                };
                return single;
            })
        )
    );

    ctx.state.data = {
        title: desc,
        description: desc,
        link,
        item: out,
    };
};
