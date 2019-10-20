const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;
    const authorid = ctx.params.authorid;
    const response = await got(utils.forumUrl, {
        method: 'get',
        params: {
            mod: 'viewthread',
            tid: tid,
            authorid: authorid,
            // 倒序查看帖子
            ordertype: 1,
        },
        baseUrl: utils.host,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const title = $('title').text();
    // const description = $('meta[name="description"]').attr('content');
    const description = $('div[id^=post_] > .t_f').html();
    const postPan = $('div[id^=post_]').nextAll();
    const item = postPan
        .map((index, element) => {
            const link = utils.host + '/' + $('[id^=postnum]', element).attr('href');
            const xw1 = $('.xw1', element);
            const author = xw1.text();
            const description = $('.t_f', element).html();
            const span = $('span[title]', element);
            const postDate = span.attr('title');
            const title = `${xw1.html()} 发表于 ${span.html()}`;
            const pubDate = new Date(`${postDate} GMT+0800`).toUTCString();

            const signle = {
                title: title,
                link: link,
                author: author,
                description: description,
                pubDate: pubDate,
            };
            return signle;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: response.url,
        description: description,
        allowEmpty: true,
        item: item,
    };
};
