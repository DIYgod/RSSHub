const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const tid = req.params.tid;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${+new Date()}`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': 'https://www.bilibili.com/'
                }
            }, (err, httpResponse, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    data = {};
                }

                const list = data.data && data.data.archives;
                let name = '未知';
                if (list && list[0] && list[0].tname) {
                    name = list[0].tname;
                }

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: `bilibili ${name}分区`,
                    link: 'https://www.bilibili.com',
                    description: `bilibili ${name}分区`,
                    lastBuildDate: new Date().toUTCString(),
                    item: list && list.map((item) => ({
                        title: `${item.title} - ${item.owner.name}`,
                        description: `${item.desc}<img referrerpolicy="no-referrer" src="${item.pic}">`,
                        pubDate: new Date(item.pubdate * 1000).toUTCString(),
                        link: `https://www.bilibili.com/video/av${item.aid}`
                    })),
                });
                callback(html);
            });
        }
    });
};