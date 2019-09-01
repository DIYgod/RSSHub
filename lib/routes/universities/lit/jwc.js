const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://www.lit.edu.cn/jwc/';
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = cheerio.load(response.data);
    const items = [];

    // 获取头条文章
    $('article.ulist').each(function() {
        const list = $(this);
        items.push({
            title: `【头条】 ` + list.find('a').text(),
            description: list.find('a').text(),
            pubDate: list
                .find('span')
                .eq(-1)
                .text(),
            link: baseUrl + list.find('a').attr('href'),
        });
    });

    // 获取其它文章
    $('article.post_box').each(function() {
        const list = $(this);
        const ddate = list
            .find('.c-top')
            .children('div')
            .text()
            .trim();
        items.push({
            title: list.find('a').attr('title'),
            description: list.children('.c-con').text(),
            pubDate: ddate.substring(0, 4) + `-` + ddate.substring(4),
            link: baseUrl + list.find('a').attr('href'),
        });
    });

    ctx.state.data = {
        title: `洛理教务在线`,
        link: baseUrl,
        description: `洛阳理工教务在线RSS，规范管理 用心服务 欢迎您访问！`,
        item: items.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: item.pubDate,
            link: item.link,
        })),
    };
};
