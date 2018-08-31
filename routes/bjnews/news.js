const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = `http://www.bjnews.com.cn/${ctx.params.cat}`;
    const res = await axios.get(url);
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('#news_ul li').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('p').text();
            const title = $('a').text();
            const itemUrl = $('a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(axios.get(itemUrl));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const data = res.data;
        const $ = cheerio.load(data);
        out[indexList[i]].description = $('#main .content').html();
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]), 24 * 60 * 60);
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
