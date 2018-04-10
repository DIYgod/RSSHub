const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const seasonid = req.params.seasonid;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: `https://bangumi.bilibili.com/jsonp/seasoninfo/${seasonid}.ver?callback=seasonListCallback&jsonp=jsonp&_=${+new Date()}`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': `https://bangumi.bilibili.com/anime/${seasonid}/`
                }
            }, (err, httpResponse, body) => {
                let data;
                try {
                    data = JSON.parse(body.match(/^seasonListCallback\((.*)\);$/)[1]);
                }
                catch (e) {
                    data = {};
                }
                const result = data.result || {};

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: result.title,
                    link: `https://bangumi.bilibili.com/anime/${seasonid}/`,
                    description: result.evaluate,
                    lastBuildDate: new Date().toUTCString(),
                    item: result.episodes && result.episodes.map((item) => ({
                        title: `第${item.index}话 ${item.index_title}`,
                        description: `更新时间：${item.update_time}<img referrerpolicy="no-referrer" src="${item.cover}">`,
                        pubDate: new Date(item.update_time).toUTCString(),
                        link: item.webplay_url
                    })),
                });
                callback(html);
            });
        }
    });
};