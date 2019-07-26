const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type = 'default' } = ctx.params;
    const urlPath = {
        default: '',
        hot: '/0-2-0-0-0-0/',
        new: '/0-1-0-0-0-0/',
    }[type];
    const url = `http://www.yidoutang.com/case${urlPath}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('.main .case-items > .case-item')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const baseInfoNode = $item('.info > .text');
            const title = baseInfoNode.find('.title').text();
            const desc = baseInfoNode.find('.desc').text();
            const link = baseInfoNode.find('a').attr('href');

            const thumbnail = $item('.img-box img').attr('src');
            const author = $item('.user a').text();

            return {
                title,
                link,
                description: [`简介: ${desc}`, `<img src="${thumbnail}"/>`].join('<br/>'),
                author,
            };
        })
        .get();

    const typeLabel = {
        default: '默认',
        hot: '热门',
        new: '最新',
    }[type];
    ctx.state.data = {
        title: `一兜糖 - 全屋记 - ${typeLabel}`,
        description: `一兜糖 - 全屋记 - ${typeLabel}`,
        link: url,
        item: items,
    };
};
