const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const blog_id = ctx.params.id;
    const base_url = `https://blog.wenxuecity.com/myblog/${blog_id}/all.html`;
    const response = await got({
        method: 'get',
        url: base_url,
        https: {
            rejectUnauthorized: false,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.articleCell.BLK_j_linedot1');
    const author = $('strong#username').text();
    const out = list
        .map(async (i, item) => {
            const link = $(item).find('a').attr('href');
            const page = await got({
                method: 'get',
                url: url.resolve('https://blog.wenxuecity.com', link),
                https: {
                    rejectUnauthorized: false,
                },
                headers: {
                    Referer: base_url,
                },
            });
            const content = cheerio.load(page.data);
            const post = {
                title: $(item).find('a').text(),
                link: link,
                author: author,
                pubDate: $(item).find('span.atc_tm.BLK_txtc').text(),
                description: content('div.articalContent').html(),
            };
            return post;
        })
        .get();
    ctx.state.data = {
        title: $('head > title').text(),
        link: base_url,
        item: await Promise.all(out),
    };
};
