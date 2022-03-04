const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.mzitu.com/zhuanti';

    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.postlist > dl > dd').get();

    ctx.state.data = {
        title: '妹子图专题',
        link,
        description: '妹子图美女专题栏目,为您精心准备各种美女图片专题,包括名站美女写真,妹子特点分类,美女大全等专题。',
        item: list.map((item) => ({
            title: $(item).find('img').attr('alt'),
            link: $(item).find('a').attr('href'),
        })),
    };
};
