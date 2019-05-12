const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = `https://www.taoguba.com.cn/index`;

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.p_list01').get();
    const links = [];
    const contents = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.pcdj06').text();
            const title = $('.pcdj02 a').attr('title');
            const partial = $('.pcdj02 a').attr('href');
            const address = `https://www.taoguba.com.cn/${partial}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: address,
                guid: address,
            };
            links.push(axios.get(address));
            contents.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await axios.all(links);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const $ = cheerio.load(res.data);
        $('img').each((index, item) => {
            item = $(item);
            item.attr('src', item.attr('data-original'));
            item.removeAttr('onload');
        });
        out[contents[i]].description = $('div#first.p_coten').html();
        ctx.cache.set(out[contents[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '淘股吧股票论坛总版',
        link: url,
        item: out,
    };
};
