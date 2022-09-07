const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const web_url = 'https://www.manhuagui.com/user/book/shelf/1';

module.exports = async (ctx) => {
    if (!config.manhuagui || !config.manhuagui.cookie) {
        throw 'manhuagui RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const cookie = config.manhuagui.cookie;
    const response = await got({
        method: 'get',
        url: web_url,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = cheerio.load(response.data);
    const user_name = $('.avatar-box').find('h3').text();
    const title = `${user_name} 的 漫画订阅`;
    const link = web_url;
    const description = `${user_name} 的 漫画订阅`;

    const item = $('.dy_content_li')
        .map(function () {
            const img_src = $(this).find('img').attr('src'); // 漫画的封面
            const manga_title = $(this).find('.co_1.c_space').first().text(); // 最新的一话题目
            const title = $(this).find('img').attr('alt'); // 漫画的名字
            const link = $(this).find('.co_1.c_space').first().children().attr('href'); // 漫画最新的链接
            const description = art(path.join(__dirname, 'templates/manga.art'), {
                manga_title,
                img_src,
            });
            const pubDate = $(this).find('.co_1.c_space').first().next().text();
            const publishDate = parseRelativeDate(pubDate); // 处理相对时间
            const single = {
                title,
                link,
                description,
                pubDate: publishDate,
            };
            return single;
        })
        .get(); // 这里获取数组= =
    ctx.state.data = {
        title,
        link,
        description,
        item,
    };
};
