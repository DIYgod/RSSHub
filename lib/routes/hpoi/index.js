const axios = require('../../utils/axios');
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
    const response = await axios({
        method: 'get',
        url: MAPs[category].url.replace(/{words}/, words),
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: MAPs[category].title + ' - ' + $('title').text(),
        item: $('.bs-glyphicons-list .detail-grid')
            .map((_index, _item) => {
                _item = $(_item);
                return {
                    title: _item.find('.detail-grid-title').text(),
                    link: host + '/' + _item.find('.detail-grid-title a').attr('href'),
                    description: _item.find('.detail-grid-info').text(),
                };
            })
            .get(),
    };
};
