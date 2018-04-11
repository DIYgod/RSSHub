const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const id = req.params.id;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.post({
                url: 'https://music.163.com/api/v3/playlist/detail',
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': 'https://music.163.com/'
                },
                form: {
                    id: id
                }
            }, (err, httpResponse, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    data = {};
                }
                const result = data.playlist || {};

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: result.name,
                    link: `https://music.163.com/#/playlist?id=${id}`,
                    description: `网易云音乐歌单 - ${result.name}`,
                    lastBuildDate: new Date().toUTCString(),
                    item: result.tracks && result.tracks.map((item) => {
                        const singer = item.ar.length === 1 ? item.ar[0].name : item.ar.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
                        return {
                            title: `${item.name} - ${singer}`,
                            description: `歌手：${singer}<br>专辑：${item.al.name}<br>日期：${new Date(item.publishTime).toLocaleDateString()}<br><img referrerpolicy="no-referrer" src="${item.al.picUrl}">`,
                            link: `https://music.163.com/#/song?id=${item.id}`
                        };
                    }),
                });
                callback(html);
            });
        }
    });
};