const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://developers.weixin.qq.com/miniprogram/dev/framework/release/`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const name = $('#docContent .content h1')
        .text()
        .replace(/[\s|#]/g, '');

    ctx.state.data = {
        title: `${name}`,
        link,
        item: $('#docContent .content h3')
            .map((_, item) => {
                item = $(item);
                const title = item.text().replace(/[\s|#]/g, '');
                return {
                    title,
                    description: item.next().html(),
                    pubDate: new Date(new RegExp(/\d{4}-\d{2}-\d{2}/).exec(title) + ' GMT+8').toUTCString(),
                    link: link + item.find('a.header-anchor').attr('href'),
                };
            })
            .get(),
        description: `${name}`,
    };
};
