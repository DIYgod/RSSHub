const cheerio = require('cheerio');
const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const url = `https://a.jiemian.com/index.php?m=lists&a=ajaxNews&cid=${ctx.params.cid}&page=1`;
    const res = await got.get(url);

    let html = res.data.substring(1);
    html = html.substring(0, html.length - 1);

    const parsed = JSON.parse(html).rst;
    const doc = cheerio.load(parsed);
    const list = doc('.item-news').slice(0, 10).get();

    const proList = [];

    let out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.item-main a').text().replace('target="_blank">', '');
            const itemUrl = $('.item-main a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(got.get(itemUrl));
            return Promise.resolve(single);
        })
    );
    const responses = await got.all(proList);

    out = util.ProcessFeed(out, responses);

    const res2 = await got.get(`https://www.jiemian.com/lists/${ctx.params.cid}.html`);
    const $ = cheerio.load(res2.data);

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
