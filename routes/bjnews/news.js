const cheerio = require('cheerio');
const config = require('../../config');
const axios = require('../../utils/axios');

const axios_ins = axios.create({
    headers: {
        'User-Agent': config.ua,
    },
});
module.exports = async (ctx) => {
    const url = `http://www.bjnews.com.cn/${ctx.params.cat}`;
    const res = await axios_ins.get(url);
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('#news_ul li');
    const out = [];
    const proList = [];
    let time, title, itemUrl;
    for (let i = 0; i < (list.length <= 20 ? list.length : 20); i++) {
        const $ = cheerio.load(list[i]);
        time = $('p').text();
        title = $('a').text();
        itemUrl = $('a').attr('href');
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(cache);
            continue;
        }
        const single = {
            title: title,
            pubDate: new Date(time).toUTCString(),
            link: itemUrl,
            guid: itemUrl,
        };
        out.push(single);
        ctx.cache.set(itemUrl, single, 24 * 60 * 60);
        proList.push(axios_ins.get(itemUrl));
    }
    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const data = res.data;
        const $ = cheerio.load(data);
        out[i].description = $('#main .content').html();
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
