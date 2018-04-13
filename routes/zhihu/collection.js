const request = require('request');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const id = req.params.id;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: `https://www.zhihu.com/collection/${id}`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': `https://www.zhihu.com/collection/${id}`
                }
            }, (err, httpResponse, body) => {
                const $ = cheerio.load(body);
                const list = $('div.zm-item');
                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: $('title').text(),
                    link: `https://www.zhihu.com/collection/${id}`,
                    description: `${$('#zh-fav-head-description').text()}`,
                    lastBuildDate: new Date().toUTCString(),
                    item: list && list.map((index, item) => {
                        item = $(item);
                        return {
                            title: item.find('.zm-item-title a').text(),
                            description: `高票答案：${item.find('textarea').text()}`,
                            link: `https://www.zhihu.com${item.find('.zm-item-title a').attr('href')}`
                        };
                    }).get(),
                });
                callback(html);
            });
        }
    });
};