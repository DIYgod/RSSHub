const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.bjp.org.cn';
    const indexUrl = baseUrl + '/col/col89/index.html';

    let limit = parseInt(ctx.query.limit);
    if (isNaN(limit) || limit === 0) {
        limit = 5;
    }
    const res = await axios.get(indexUrl);
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('b > a');
    const urls = [];
    const titles = [];
    for (let i = 0; i < limit && i < list.length; i++) {
        urls.push(baseUrl + list[i].attribs.href);
        titles.push(list[i].attribs.title);
    }

    const items = await Promise.all(
        urls.map(async (url, i) => {
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const data = (await axios.get(url)).data;
            const $ = cheerio.load(data);
            const time = $('meta[name=pubDate]').attr('content');
            const title = titles[i];
            const item = {
                title,
                pubDate: new Date(time).toUTCString(),
                description: $('body > table > tbody')
                    .eq(1)
                    .html(),
                link: url,
                guid: url,
            };
            ctx.cache.set(url, JSON.stringify(item), limit * 24 * 60 * 60);
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: '北京天文馆每日一图',
        link: indexUrl,
        item: items,
    };
};
