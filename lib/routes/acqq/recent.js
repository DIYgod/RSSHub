const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseURL = 'https://ac.qq.com/';
    const id = ctx.params.id;
    const url = `${baseURL}/Comic/comicInfo/id/${id}`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('span', '.chapter-page-new');
    const title = $('.works-intro-title');

    ctx.state.data = {
        title: title.find('strong').text(),
        link: 'https://ac.qq.com/Comic/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        description: item.html(),
                        title: item.find('a').attr('title'),
                        // description: `作者：${item.find('.usr-pic a').last().text()}`,
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
