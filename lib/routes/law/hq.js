const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.glo.com.cn/news/publications_list13.html';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('ul.ul-list li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').attr('title');
            const itemurl = $('a').attr('href');

            const responses = await got.get(itemurl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemurl,
                description: $d('article').html(),
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
