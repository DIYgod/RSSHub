const cheerio = require('cheerio');
const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const url = `https://matters.news/topics`;

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const list = $('section.jsx-1110843272.container').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('time').attr('datetime');
            const title = $('h2').text();
            const postfix = encodeURI($('a.jsx-1110843272').attr('href'));
            const address = `https://matters.news${postfix}`;
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
            proList.push(axios.get(address));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const $ = cheerio.load(res.data);
        out[indexList[i]].description = $('.u-content').html();
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
