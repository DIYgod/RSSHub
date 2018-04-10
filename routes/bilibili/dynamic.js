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
            request.get({
                url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': `https://space.bilibili.com/${uid}/`
                }
            }, (err, httpResponse, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    data = {};
                }
                const result = data.data && data.data.cards || {};

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: `${result[0].desc.user_profile.info.uname} 的 bilibili 动态`,
                    link: `https://space.bilibili.com/${uid}/#/dynamic`,
                    description: `${result[0].desc.user_profile.info.uname} 的 bilibili 动态`,
                    lastBuildDate: new Date().toUTCString(),
                    item: result.map((item) => {
                        const parsed = JSON.parse(item.card);
                        const data = parsed.item || parsed;

                        // img
                        let imgHTML = '';
                        if (data.pictures) {
                            for (let i = 0; i < data.pictures.length; i++) {
                                imgHTML += `<img referrerpolicy="no-referrer" src="${data.pictures[i].img_src}">`;
                            }
                        }
                        if (data.pic) {
                            imgHTML += `<img referrerpolicy="no-referrer" src="${data.pic}">`;
                        }

                        // link
                        let link = '';
                        if (data.dynamic_id) {
                            link = `https://t.bilibili.com/${data.dynamic_id}`;
                        }
                        else if (data.aid) {
                            link = `https://www.bilibili.com/video/av${data.aid}`;
                        }
                        else if (data.id) {
                            link = `https://h.bilibili.com/${data.id}`;
                        }

                        return {
                            title: data.title || data.description || data.content,
                            description: `${data.desc || data.description || data.content}${imgHTML}`,
                            pubDate: new Date((data.pubdate || data.upload_time || data.timestamp) * 1000).toUTCString(),
                            link: link
                        };
                    }),
                });
                callback(html);
            });
        }
    });
};