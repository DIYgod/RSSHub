const axios = require('axios');
const qs = require('querystring');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx, next) => {
    const city = ctx.params.city || 'sh';
    const keyword = ctx.params.keyword || '';
    const iswhole = ctx.params.iswhole || 0;
    const room = ctx.params.room || 1;
    const domain = `${city === 'bj' ? '' : city + '.'}m.ziroom.com`;

    const response = await axios({
        method: 'post',
        url: `http://${domain}/list/ajax-get-data`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `http://${domain}/${city.toUpperCase()}/search.html`
        },
        data: qs.stringify({
            'recent_money': 0,
            'sort': 0,
            'is_whole': iswhole,
            'room': room,
            'key_word': keyword,
            'step': 0
        }),
    });

    const data = response.data.data;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `自如的${keyword}${iswhole ? '整租' : '合租'}${room}室房源`,
        link: `http://${domain}`,
        description: `自如的${keyword}${iswhole ? '整租' : '合租'}${room}室房源`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => ({
            title: item.title,
            description: `${item.room_name}<img referrerpolicy="no-referrer" src="${item.list_img}">`,
            link: `http://${domain}/${city.toUpperCase()}/room/${item.id}.html`
        })),
    });

    next();
};