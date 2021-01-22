const got = require('@/utils/got');
const cheerio = require('cheerio');

const categories = {
    1: '同人誌 漢化',
    2: '同人誌 CG畫集',
    3: '同人誌 Cosplay',
    5: '同人誌',
    6: '單行本',
    7: '雜誌&短篇',
    9: '單行本 漢化',
    10: '雜誌&短篇 漢化',
    12: '同人誌 日語',
    13: '單行本 日語',
    14: '雜誌&短篇 日語',
};

module.exports = async (ctx) => {
    const cid = ctx.params.cid;
    if (!cid || !Object.keys(categories).includes(cid)) {
        ctx.state.data = {
            title: '此分类不存在',
        };
        return;
    }
    const url = `https://www.wnacg.com/albums-index-cate-${cid}.html`;
    const response = await got.get(url);

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.pic_box');

    ctx.state.data = {
        title: '紳士漫畫 - ' + categories[cid],
        link: url,
        item: list
            .map((index, item) => {
                item = $(item);
                const thumbnail_url = 'https:' + `${item.find('a > img').attr('src') ? item.find('a > img').attr('src') : item.find('a > img').attr('data-original')}`;
                const link_url = 'https://wnacg.org' + `${item.find('a').attr('href')}`;
                return {
                    title: item.find('a').attr('title'),
                    description: `<img src=${thumbnail_url} referrerpolicy="no-referrer">`,
                    link: link_url,
                };
            })
            .get(),
    };
};
