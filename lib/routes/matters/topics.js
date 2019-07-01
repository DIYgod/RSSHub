const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://matters.news/topics`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('li section.container').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('time').attr('datetime');
            const title = $('h2').text();
            const author = $('div.content a')
                .attr('href')
                .replace(/\/@(.*?)\/.*/, '$1');
            const postfix = encodeURI($('div.content a').attr('href'));
            const address = `https://matters.news${postfix}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                author,
                link: address,
                guid: address,
            };
            proList.push(got.get(address));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await got.all(proList);
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
