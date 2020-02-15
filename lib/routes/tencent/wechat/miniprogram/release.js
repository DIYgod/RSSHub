const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://developers.weixin.qq.com/miniprogram/dev/framework/release/';
    const response = await got({
        method: 'get',
        url: link,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const name = $('#docContent .content h1')
        .text()
        .replace(/[\s|#]/g, '');
    const titles = $('#docContent .content h3').map((i, ele) =>
        $(ele)
            .text()
            .replace(/[\s|#]/g, '')
    );
    const list = $('#docContent > .content ol')
        .map((i, ele) => ({
            title: titles[i],
            description: $(ele).html(),
        }))
        .get();

    ctx.state.data = {
        title: `${name}最新动态`,
        link: link,
        item: list,
        description: '基础库更新日志RSS',
    };
};
