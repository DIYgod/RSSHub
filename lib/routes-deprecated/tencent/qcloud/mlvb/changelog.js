const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://cloud.tencent.com/document/product/454/7878';

    const res = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(res.data);

    const resultItem = [];
    $('.J-mainDetail #docArticleContent h3').each(function () {
        const item = {};
        item.title = $(this).text();
        item.description = $(this).nextUntil('h3').text();
        item.link = url;
        item.guid = $(this).text();
        resultItem.push(item);
    });

    ctx.state.data = {
        title: '腾讯移动直播 SDK 更新日志',
        link: url,
        item: resultItem,
    };
};
