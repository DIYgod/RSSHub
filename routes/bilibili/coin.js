const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const uid = req.params.uid;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.post({
                url: 'https://space.bilibili.com/ajax/member/GetInfo',
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': `https://space.bilibili.com/${uid}/`,
                    'Origin': 'https://space.bilibili.com'
                },
                form: {
                    mid: uid
                }
            }, function (err, httpResponse, body) {
                const name = JSON.parse(body).data.name;
                request.get({
                    url: `https://space.bilibili.com/ajax/member/getCoinVideos?mid=${uid}`,
                    headers: {
                        'User-Agent': mix.ua,
                        'Referer': `https://space.bilibili.com/${uid}/`
                    }
                }, function (err, httpResponse, body) {
                    let data;
                    try {
                        data = JSON.parse(body);
                    }
                    catch (e) {
                        data = {};
                    }

                    const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                        title: `${name} 的 bilibili 投币视频`,
                        link: `https://space.bilibili.com/${uid}`,
                        description: `${name} 的 bilibili 投币视频`,
                        lastBuildDate: new Date().toUTCString(),
                        item: data.data && data.data.list && data.data.list.map((item) => ({
                            title: item.title,
                            description: `${item.title}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
                            link: `https://www.bilibili.com/video/av${item.stat.aid}`
                        })),
                    });
                    callback(html);
                });
            });
        }
    });
};