const request = require('request');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: 'https://www.jianshu.com',
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': 'https://www.jianshu.com'
                }
            }, (err, httpResponse, body) => {
                const $ = cheerio.load(body);
                const list = $('.note-list li');

                const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                    title: '简书首页',
                    link: 'https://www.jianshu.com',
                    description: $('meta[name="description"]').attr('content'),
                    lastBuildDate: new Date().toUTCString(),
                    item: list && list.map((index, item) => {
                        item = $(item);
                        return {
                            title: item.find('.title').text(),
                            description: `作者：${item.find('.nickname').text()}<br>描述：${item.find('.abstract').text()}<br><img referrerpolicy="no-referrer" src="https:${item.find('.img-blur').data('echo')}">`,
                            pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                            link: `https://www.jianshu.com${item.find('.title').attr('href')}`
                        };
                    }).get(),
                });
                callback(html);
            });
        }
    });
};