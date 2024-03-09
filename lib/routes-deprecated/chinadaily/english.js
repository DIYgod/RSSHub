const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const baseUrl = 'https://language.chinadaily.com.cn';
    const url = `${baseUrl}/${category}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const categoryName = $('.CT_title').first().text();
    const items = $('.gy_box')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const link = $item('.gy_box_img').attr('href');
            const imgUrl = $item('.gy_box_img img').attr('src');
            const realImgUrl = imgUrl.includes('http') ? imgUrl : `https:${imgUrl}`;
            const title = $item('.gy_box_txt2').text();
            const desc = $item('.gy_box_txt3').text();
            return {
                title,
                link: link.trim().replace(/^\/\//, 'https://'),
                description: [`<img src="${realImgUrl}"/>`, desc].join('<br/>'),
            };
        })
        .get();
    ctx.state.data = {
        title: `中国日报 - ${categoryName}`,
        description: `中国日报 - ${categoryName}`,
        link: url,
        item: items,
    };
};
