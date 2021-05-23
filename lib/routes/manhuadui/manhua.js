const got = require('@/utils/got');
const host = 'https://www.manhuadui.com';
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const serial = parseInt(ctx.params.serial);
    const comicPage = host + `/manhua/${name}/`;
    const response = await got({
        method: 'get',
        url: comicPage,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const contentLength = $('div.zj_list_con').length;
    const comicTitle = $('div.comic_deCon > h1').text().trim();
    const comicDescription = $('p.comic_deCon_d').text().trim();
    let list = $('div.zj_list_con')
        .eq(serial - 1)
        .find('ul > li > a');
    if (isNaN(serial) || serial <= 0 || contentLength < serial) {
        list = $('div.zj_list_con > ul > li > a');
    }
    ctx.state.data = {
        title: '漫画堆 - ' + comicTitle,
        link: comicPage,
        description: comicDescription,
        item: list
            .map((i, item) => ({
                title: $(item).attr('title').trim(),
                description: $(item).attr('title').trim(),
                link: host + $(item).attr('href'),
            }))
            .get(),
    };
};
