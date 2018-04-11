const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const category = req.params.category;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: 'https://gold-tag-ms.juejin.im/v1/categories',
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': `https://juejin.im/welcome/${category}`,
                    'X-Juejin-Client': '',
                    'X-Juejin-Src': 'web',
                    'X-Juejin-Token': '',
                    'X-Juejin-Uid': ''
                }
            }, function (err, httpResponse, body) {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (e) {
                    data = {};
                }
                const cat = data.d && data.d.categoryList && data.d.categoryList.filter((item) => item.title === category)[0];
                if (cat && cat.id) {
                    request.get({
                        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&limit=20&category=${cat.id}`,
                        headers: {
                            'User-Agent': mix.ua,
                            'Referer': `https://juejin.im/welcome/${category}`,
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
                            title: `掘金${cat.name}`,
                            link: `https://juejin.im/welcome/${category}`,
                            description: `掘金${cat.name}`,
                            lastBuildDate: new Date().toUTCString(),
                            item: data.d && data.d.entrylist && data.d.entrylist.map((item) => ({
                                title: item.title,
                                description: `${(item.content || item.summaryInfo || '无描述').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')}`,
                                pubDate: new Date(item.createdAt).toUTCString(),
                                link: item.originalUrl
                            })),
                        });
                        callback(html);
                    });
                }
                else {
                    callback('');
                }
            });
        }
    });
};