const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.chuhaibiji.com/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('ul[class="post-loop post-loop-default tab-wrap clearfix active"] li[class="item"]');
    ctx.state.data = {
        title: `出海笔记 ~ 资讯`,
        link: `https://www.secshi.com/`,
        description: '出海笔记 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('h2 a', item).text(),
                        link: $('h2 a', item).attr('href'),
                        description: $('p', item).text(),
                        pubDate: new Date($('span[class="item-meta-li date"]', item).text()).toUTCString(),
                    };
                })
                .get(),
    };
};
