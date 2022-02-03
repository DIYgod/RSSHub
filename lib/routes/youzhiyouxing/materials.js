const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://youzhiyouxing.cn/materials`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('[phx-click=material]');
    const resData = {
        title: '有知有行 - 有知',
        link,
        description: '有知有行 - 有知',
        item: list
            .map((_index, item) => {
                const $item = $(item);
                const res = {
                    title: $item.find('.title-bar > h3').text(),
                    description: $item.find('.sm-text').text(),
                    link: `https://youzhiyouxing.cn/materials/${$item.attr('phx-value-id')}`,
                };
                return res;
            })
            .get(),
    };
    ctx.state.data = resData;
};
