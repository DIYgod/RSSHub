const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.jtnfa.com/CN/majorbook.aspx?Lan=CN&PageUrl=majorbook&MenuID=06001';
    const ori_url = 'https://www.jtnfa.com/CN/';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.col-sm-9 .news_list').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').html();
            const sub_url = $('a').attr('href');
            const itemUrl = ori_url + sub_url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.col-sm-9 .news_page_content').html(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
