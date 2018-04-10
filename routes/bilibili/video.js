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
                    url: `https://api.bilibili.com/x/v2/fav/video?vmid=${uid}&ps=30&tid=0&keyword=&pn=1&order=fav_time`,
                    headers: {
                        'User-Agent': mix.ua,
                        'Referer': `https://space.bilibili.com/${uid}/`,
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
                        title: `${name} 的 bilibili 空间`,
                        link: `https://space.bilibili.com/${uid}`,
                        description: `${name} 的 bilibili 空间`,
                        lastBuildDate: new Date().toUTCString(),
                        item: data.data && data.data.archives && data.data.archives.map((item) => ({
                            title: `${item.title} - ${item.owner.name}`,
                            description: `${item.desc}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
                            pubDate: new Date(item.pubdate * 1000).toUTCString(),
                            link: `https://www.bilibili.com/video/av${item.aid}`
                        })),
                    });
                    callback(html);
                });
            });
        }
    });
};