import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const link = `https://developers.weixin.qq.com/miniprogram/dev/devtools/uplog.html`;
    const {
        data
    } = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(data);
    const name = $('#docContent .content h1')
        .text()
        .replace(/[\s|#]/g, '');

    ctx.state.data = {
        title: name,
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
                        (item.text().includes('更新说明') ? '<h3><a href="' + item.find('a[target="_blank"]').attr('href') + '" target="_blank" rel="noopener noreferrer">更新说明<span></span></a></h3>' : '') +
                        item.next().html(),
                    pubDate: new Date(title + ' GMT+8').toUTCString(),
                    link: link + item.find('a.header-anchor').attr('href'),
                };
            })
            .get(),
        description: name,
    };
};
