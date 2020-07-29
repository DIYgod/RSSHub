const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.allbrightlaw.com/CN/10475.aspx';
    const ori_url = 'https://www.allbrightlaw.com';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.news_list_img ul li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.news_txt h2').html();
            const sub_url = $('a').attr('href');
            const itemUrl = ori_url + sub_url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.news_content_box .news_content').html(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
