const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.yidoutang.com/';
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('.main > .article')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const baseInfoNode = $item('.title > a');
            const title = baseInfoNode.text();
            const link = baseInfoNode.attr('href');
            const thumbnail = $item('.article > a > img').attr('delayload');
            const desc = $item('.abstract').text();
            const tip = $item('.tip').text();
            const author = $item('.avatar a').text();
            return {
                title,
                link,
                description: [`分类: ${tip}`, `简介: ${desc}`, `<img src="${thumbnail}"/>`].join('<br/>'),
                author,
            };
        })
        .get();
    ctx.state.data = {
        title: '一兜糖 - 精选',
        description: '一兜糖 - 精选',
        link: url,
        item: items,
    };
};
