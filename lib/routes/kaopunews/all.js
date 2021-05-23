const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://kaopu.news/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('a[target="_blank"]');
    ctx.state.data = {
        title: '靠谱新闻',
        link: 'https://kaopu.news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: `${item.find('h3').text()}(${item.attr('class').substring(8)})`,
                        description: item.find('h3').next().next().text(),
                        link: item.attr('href'),
                    };
                })
                .get(),
    };
};
