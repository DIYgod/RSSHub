const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = ctx.params.host;
    const link = `https://wolley.io/items?host=${host}`;

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    // 使用 cheerio 加载返回的 HTML
    const $ = cheerio.load(data);
    const list = $('div[class=item-text]');

    ctx.state.data = {
        title: `wolley #${host}`,
        link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const comments_path = item.find('.comments-link a').attr('href');
                    const user_name = item
                        .find('.by a')
                        .first()
                        .text()
                        .trim();

                    return {
                        title: item
                            .find('.title a')
                            .first()
                            .text(),
                        description: `via <a href=https://wolley.io/user/${user_name}>@${user_name}</a><br><a href=https://wolley.io${comments_path}>Comments</a>`,
                        link: item
                            .find('.title a')
                            .first()
                            .attr('href'),
                    };
                })
                .get(),
    };
};
