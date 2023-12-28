const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.hpoi.net/bannerItem/list?categoryId=0&bannerItemType=0&subType=0&page=1';
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: `Hpoi 手办维基 - 热门推荐`,
        link,
        item: $('#content .item')
            .map((_index, _item) => {
                _item = $(_item);
                return {
                    title: _item.find('.title').text(),
                    link: 'https://www.hpoi.net/' + _item.find('a').attr('href'),
                    description: `<img src="${_item.find('img').attr('src')}">`,
                    pubDate: new Date(_item.find('.time').text().replace('发布时间：', '')).toUTCString(),
                };
            })
            .get(),
    };
};
