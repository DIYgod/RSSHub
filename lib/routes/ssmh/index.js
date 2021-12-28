const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://wnacg.org/albums.html',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.pic_box');
    let thumbnail_url;
    let link_url;
    ctx.state.data = {
        title: '紳士漫畫',
        link: 'https://wnacg.org/albums.html',
        item: list
            .map((index, item) => {
                item = $(item);
                thumbnail_url = `https:${item.find('a > img').attr('src') ?? item.find('a > img').attr('data-original')}`;
                link_url = `https://wnacg.org${item.find('a').attr('href')}`;
                return {
                    title: item.find('a').attr('title'),
                    description: `<img src=${thumbnail_url} referrerpolicy="no-referrer">`,
                    link: link_url,
                };
            })
            .get(),
    };
};
