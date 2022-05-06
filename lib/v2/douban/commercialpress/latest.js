const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://site.douban.com/commercialpress/room/827243/';
    const { data: roomResponse } = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: 'https://site.douban.com/commercialpress/',
        },
    });
    let $ = cheerio.load(roomResponse);
    const $mod = $('.mod').eq(0);
    const title = $mod.find('.hd > h2 span').eq(0).text();
    const newBookUrl = $mod.find('.pl a').attr('href');

    const newBookLandingPage = await got({
        method: 'get',
        url: newBookUrl,
        headers: {
            Referer: link,
        },
    });

    // 这个有个重定向，需要获取到真实地址后添加排序参数后再请求一次
    const realUrl = `${newBookLandingPage.request.options.url.href}?sort=time&sub_type=`;
    const newBookPage = await got({
        method: 'get',
        url: realUrl,
        headers: {
            Referer: link,
        },
    });

    $ = cheerio.load(newBookPage.data);
    const resultItem = $('.doulist-item')
        .map((_, item) => {
            const $item = $(item);

            return {
                title: $item.find('.title > a').text(),
                link: $item.find('.title > a').attr('href'),
                description: `<img src="${$item.find('.post img').attr('src')}" /><br>${$item.find('.abstract').html()}`,
                pubDate: new Date($item.find('.time > span').attr('title')).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: `商务印书馆-${title}`,
        link,
        item: resultItem,
    };
};
