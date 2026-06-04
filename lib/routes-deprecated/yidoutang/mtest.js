const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.yidoutang.com/mtest';
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('.zc-bd .zc-bd-left > .clearfix > a')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const link = ele.attribs.href;
            const thumbnail = $item('.top > img').attr('src');
            const deadline = $item('.top > .time').text();
            const otherInfoArr = $item('.bottom').text().trim().split('\n');
            const title = otherInfoArr[0];

            return {
                title,
                link,
                description: [deadline, ...otherInfoArr, `<img src="${thumbnail}"/>`].filter((str) => !!str.trim()).join('<br/>'),
            };
        })
        .get();
    ctx.state.data = {
        title: '一兜糖 - 众测',
        description: '一兜糖 - 众测',
        link: url,
        item: items,
    };
};
