const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const config = require('@/config').value;
const url = "https://www.manhuagui.com/user/book/shelf/1";
const cookie = config.manhuagui.cookie;

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: "https://www.manhuagui.com/",
            Cookie: cookie
        },
    });
    const $ = cheerio.load(response.data);
    const user_name = $('.avatar-box').find('h3').text();
    const title = `${user_name} 的 漫画订阅`;
    const link = url;
    const description = `${user_name} 的 漫画订阅`;

    const item = $('.dy_content_li').map(function (i, el) {
        const img_src = $(this).find('img').attr('src'); //漫画的封面
        const manga_title = $(this).find(".co_1.c_space").first().text();// 最新的一话题目
        const title = $(this).find('img').attr('alt');//漫画的名字
        const link = $(this).find(".co_1.c_space").first().children().attr('href');//漫画最新的链接
        const description = `
        <h1>${manga_title}</h1>
        <img src='${img_src}' />`.trim();
        const pubDate = $(this).find(".co_1.c_space").first().next().text();
        const publishDate = parseRelativeDate(pubDate);  //处理相对时间
        const single = {
            title: title,
            link: link,
            description: description,
            pubDate: publishDate,
        };
        return single;
    }).get();  //这里获取数组= =
    ctx.state.data = {
        title,
        link,
        description,
        item,
    };
};
