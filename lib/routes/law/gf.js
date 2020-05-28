const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.grandwaylaw.com/cn/publications/articles.html';
    const ori_url = 'http://www.grandwaylaw.com';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.cbw ul li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').html();
            const sub_url = $('a').attr('href');
            const itemUrl = ori_url + sub_url;

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.xwzz .txt').html(),
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
