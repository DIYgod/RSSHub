const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `http://changba.com/u/${userid}`;
    const response = await got.get(url);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#work_list li').get();
    const author = $('.userPage-user-name').text();

    const items = list.map((item) => {
        const $ = cheerio.load(item);
        const $a = $('a');
        const link = 'http://changba.com' + $a.attr('href');
        const single = {
            title: $a.text(),
            description: link,
            link: link,
            author: author,
        };
        return single;
    });

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: items,
    };
};
