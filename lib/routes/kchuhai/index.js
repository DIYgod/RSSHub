const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.kchuhai.com/report/`;

    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('div[class="position-relative"]');
    ctx.state.data = {
        title: `出海 ~ 资讯`,
        link: `www.kchuhai.com`,
        description: '出海 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('div', item).children('a').text(),
                        link: $('div', item).children('a').attr('href'),
                    };
                })
                .get(),
    };
};
