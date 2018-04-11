const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const city = req.params.city || 'sh';
    const keyword = req.params.keyword || '';
    const iswhole = req.params.iswhole || 0;
    const room = req.params.room || 1;
    const domain = `${city === 'bj' ? '' : city + '.'}m.ziroom.com`;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.post({
                url: `http://${domain}/list/ajax-get-data`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': `http://${domain}/${city.toUpperCase()}/search.html`
                },
                form: {
                    'recent_money': 0,
                    'sort': 0,
                    'is_whole': iswhole,
                    'room': room,
                    'key_word': keyword,
                    'step': 0
                }
            }, (err, httpResponse, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    data = {};
                }
                const result = data.data || [];

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: `自如的${keyword}${iswhole ? '整租' : '合租'}${room}室房源`,
                    link: `http://${domain}`,
                    description: `自如的${keyword}${iswhole ? '整租' : '合租'}${room}室房源`,
                    lastBuildDate: new Date().toUTCString(),
                    item: result && result.map((item) => ({
                        title: item.title,
                        description: `${item.room_name}<img referrerpolicy="no-referrer" src="${item.list_img}">`,
                        link: `http://${domain}/${city.toUpperCase()}/room/${item.id}.html`
                    })),
                });
                callback(html);
            });
        }
    });
};