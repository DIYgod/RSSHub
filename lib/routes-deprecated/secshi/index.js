const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.secshi.com/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('ul[class="b2_gap"] li[class="post-3-li post-list-item"]');
    ctx.state.data = {
        title: `安全师 ~ 资讯`,
        link: `https://www.secshi.com/`,
        description: '安全师 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('h2', item).text(),
                        link: $('h2 a', item).attr('href'),
                        description: $('div[class="post-excerpt"]', item).text(),
                    };
                })
                .get(),
    };
};
