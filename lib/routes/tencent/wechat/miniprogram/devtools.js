const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html`;
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
                const title = item
                    .text()
                    .replace(/[\s|#]/g, '')
                    .replace(/更新说明/g, '');
                return {
                    title,
                    description:
                        (item.text().indexOf('更新说明') !== -1 ? '<h3><a href="' + item.find('a[target="_blank"]').attr('href') + '" target="_blank" rel="noopener noreferrer">更新说明<span></span></a></h3>' : '') +
                        item.next().html(),
                    pubDate: new Date(title + ' GMT+8').toUTCString(),
                    link: link + item.find('a.header-anchor').attr('href'),
                };
            })
            .get(),
        description: `${name}`,
    };
};
