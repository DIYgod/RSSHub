const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = `https://www.jiemian.com/lists/${ctx.params.cid}.html`;

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.news-view').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.date').text();
            let title = $('.news-img a').attr('title');
            if (!title) {
                title = $('a').text();
            }
            const itemUrl = $('.news-img a').attr('href');
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
        const $ = cheerio.load(res.data);

        let time = $('.article-info span')
            .eq(1)
            .text();
        if (!time) {
            time = $('.article-header .info .date').text();
        }
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.article-view .article-main').html();
        out[indexList[i]].description = content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]), 24 * 60 * 60);
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
