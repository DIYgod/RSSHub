const got = require('@/utils/got');
const host = 'https://manhua.fzdm.com';
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const comicPage = host + `/${id}/`;
    const response = await got({
        method: 'get',
        url: comicPage,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div#content > li > a');
    const comicTitle = $('div#content > img').attr('alt').replace(/漫画/, '');
    ctx.state.data = {
        title: '风之动漫 - ' + comicTitle,
        link: comicPage,
        description: '风之动漫',
        item: list
            .map((i, item) => ({
                title: $(item).text().trim(),
                description: $(item).text().trim(),
                link: comicPage + $(item).attr('href'),
            }))
            .get(),
    };
};
