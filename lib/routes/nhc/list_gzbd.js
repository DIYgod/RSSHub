const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.zxxx_list a').get();
    const out = await Promise.all(
        list.splice(0, 10).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $(item).text();
            const address = $(item).attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const host = `http://www.nhc.gov.cn/`;
            const single = {
                title,
                description: title,
                link: host + address,
                guid: host + address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '疫情通报-国家卫健委',
        link: url,
        item: out,
    };
};
