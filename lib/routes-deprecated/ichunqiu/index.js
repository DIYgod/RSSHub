const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://bbs.ichunqiu.com/portal.php';
    const baseSite = 'https://bbs.ichunqiu.com/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('li[class="ui_2_ul_li  cl border_b_gray"]');
    ctx.state.data = {
        title: `i春秋学院 ~ 资讯`,
        link: `https://buaq.net/`,
        description: 'i春秋学院 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('h3', item).text(),
                        link: baseSite + $('h3 a', item).attr('href'),
                        description: $('p', item).text(),
                    };
                })
                .get(),
    };
};
