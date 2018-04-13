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
            request.get({
                url: 'https://music.163.com/api/artist/albums/' + id,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': 'https://music.163.com/'
                }
            }, (err, httpResponse, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    data = {};
                }
                const result = data;

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: result.artist.name,
                    link: `https://music.163.com/#/album?id=${id}`,
                    description: `网易云音乐歌手专辑 - ${result.artist.name}`,
                    lastBuildDate: new Date().toUTCString(),
                    item: result.hotAlbums && result.hotAlbums.map((item) => {
                        const singer = item.artists.length === 1 ? item.artists[0].name : item.artists.reduce((prev, cur) => (prev.name || prev) + '/' + cur.name);
                        return {
                            title: `${item.name} - ${singer}`,
                            description: `歌手：${singer}<br>专辑：${item.name}<br>日期：${new Date(item.publishTime).toLocaleDateString()}<br><img referrerpolicy="no-referrer" src="${item.picUrl}">`,
                            link: `https://music.163.com/#/album?id=${item.id}`
                        };
                    }),
                });
                callback(html);
            });
        }
    });
};
