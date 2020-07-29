const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const html = await got({
        method: 'get',
        url: `https://www.topys.cn/category/${category}.html`,
        headers: {
            referer: `https://www.topys.cn/category/${category}.html`,
            cookie: 'PHPSESSID=8gd6q9j2h0o6fpsl570ah3chg8; can_webp=true',
        },
    });
    const $ = cheerio.load(html.data);

    const response = await got({
        method: 'post',
        url: 'https://www.topys.cn/ajax/article/get_article_list',
        form: {
            needloginpage: 2,
            islogin: 0,
            module: 'article',
            column: category,
            timestape: $('#login-vue').attr('data-timestape'),
            token: $('#login-vue').attr('data-token'),
            offset: 0,
            size: 12,
            page: 0,
            type: 'column',
            need_count: true,
        },
        headers: {
            referer: `https://www.topys.cn/category/${category}.html`,
            cookie: 'PHPSESSID=8gd6q9j2h0o6fpsl570ah3chg8; can_webp=true',
        },
    });

    const items = response.data.result.map((item) => {
        const single = {
            title: item.title,
            description: item.content,
            pubDate: new Date(item.app_push_time + '000').toUTCString(),
            link: `http://www.topys.cn/article/detail?id=${item.id}`,
            author: item.editor,
        };
        return single;
    });

    ctx.state.data = {
        title: 'TOPYS | 全球顶尖创意分享平台 OPEN YOUR MIND',
        link: `https://www.topys.cn/category/${category}.html`,
        description: 'TOPYS | 全球顶尖创意分享平台 OPEN YOUR MIND',
        item: items,
    };
};
