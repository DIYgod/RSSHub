const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.haiwen-law.com/class/view?id=19';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('div.newlist ul li.clearfix').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.ittitle a').html();
            const itemurl = $('.ittitle a').attr('href');

            const responses = await got.get(itemurl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemurl,
                description: $d('.large').html(),
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
