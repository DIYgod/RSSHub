const got = require('@/utils/got');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = async (ctx) => {
    const { type = 'all' } = ctx.params;
    const reqUrl = 'https://www.hpoi.net/user/home/ajax';
    const formData = new FormData();
    Object.entries({
        page: 1,
        type: 'info',
        catType: type,
    }).forEach(([key, value]) => formData.append(key, value));
    const response = await got.post(reqUrl, {
        body: formData,
    });
    const $ = cheerio.load(response.data.data.html);

    const items = $('.home-info')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const leftNode = $item('.overlay-container');
            const link = leftNode
                .find('a')
                .first()
                .attr('href');
            const typeName = leftNode
                .find('.type-name')
                .first()
                .text();
            const imgUrl = leftNode
                .find('.img')
                .first()
                .attr('href');
            const rightNode = $item('.home-info-content');
            const infoType = rightNode.find('.user-name').contents();
            const infoTitle = rightNode.find('.user-content').text();
            return {
                title: infoTitle,
                link,
                category: infoType,
                description: [`类型:${typeName}`, infoTitle, `更新内容: ${infoType}`, `<img src=""${imgUrl}/>`].join('<br/>'),
            };
        })
        .get();

    const typeToLabel = {
        all: '全部',
        hobby: '手办',
        model: '模型',
    };
    const title = `手办维基 - 情报 - ${typeToLabel[type]}`;
    ctx.state.data = {
        title,
        link: `https://www.hpoi.net/user/home?type=info&catType=${type}`,
        description: title,
        item: items,
    };
};
