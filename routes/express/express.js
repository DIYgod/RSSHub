const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const company = req.params.company;
    const number = req.params.number;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: `https://www.kuaidi100.com/query?type=${company}&postid=${number}`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': 'https://www.kuaidi100.com'
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
                    title: `快递 ${company}-${number}`,
                    link: 'https://www.kuaidi100.com',
                    description: `快递 ${company}-${number}`,
                    lastBuildDate: new Date().toUTCString(),
                    item: result && result.map((item) => ({
                        title: item.context,
                        description: item.context,
                        pubDate: new Date(item.time || item.ftime).toUTCString(),
                        link: item.context
                    })),
                });
                callback(html);
            });
        }
    });
};