const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.hpoi.net';

const MAPs = {
    charactar: {
        url: `${host}/hobby/all?charactar={words}&order=release`,
        title: '角色手办',
    },
    works: {
        url: `${host}/hobby/all?works={words}&order=release`,
        title: '作品手办',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params && ctx.params.category;
    const words = ctx.params && ctx.params.words;
    const link = MAPs[category].url.replace(/{words}/, words);
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: 'Hpoi 手办维基' + ' - ' + $(`#${category}`).text().trim(),
        link,
        item: $('.bs-glyphicons-list .detail-grid')
            .map((_index, _item) => {
                _item = $(_item);
                return {
                    title: _item.find('.detail-grid-title').text(),
                    link: host + '/' + _item.find('.detail-grid-title a').attr('href'),
                    description: `<img src="${_item.find('.thumbnail img').attr('src')}">${_item.find('.detail-grid-info span').eq(0).text()}<br>${_item.find('.detail-grid-info span').eq(1).text()}<br>${_item
                        .find('.detail-grid-info span')
                        .eq(2)
                        .text()}`,
                };
            })
            .get()
            .reverse(),
    };
};
