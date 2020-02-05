const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;
    const authorid = ctx.params.authorid;
    const response = await got(utils.forumUrl, {
        method: 'get',
        searchParams: queryString.stringify({
            mod: 'viewthread',
            tid: tid,
            authorid: authorid,
            // 倒序查看帖子
            ordertype: 1,
        }),
        prefixUrl: utils.host,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    // const description = $('div[id^=post_] > .t_f').html();
    const postPan = authorid ? $('#postlist > div[id^=post_]') : $('#postlist > div[id^=post_]').nextAll();
    const item = postPan
        .map((index, element) => {
            const link = utils.host + '/' + $('[id^=postnum]', element).attr('href');
            const xw1 = $('.authi > .xw1', element);
            const author = xw1.text();
            const description = $('.t_f', element).html();
            const em = $('[id^=authorposton]', element);
            const date = em.text();
            const span = $('span[title]', em);
            // mcbbs 表示时间有两种格式
            const postDate = span.attr('title') || date;
            const title = `${xw1.html()} ${em.html()}`;
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
