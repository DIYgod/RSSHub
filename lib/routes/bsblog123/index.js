const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://bsblog123.com/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('div[class="whitebg bloglist"] li');
    ctx.state.data = {
        title: `冰山博客 ~ 资讯`,
        link: `https://bsblog123.com`,
        description: '冰山博客 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('h3.blogtitle', item).text(),
                        link: $('h3 a', item).attr('href'),
                        description: $('p', item).text(),
                    };
                })
                .get(),
    };
};
