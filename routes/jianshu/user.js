const axios = require('axios');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.jianshu.com/u/${id}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://www.jianshu.com/u/${id}`
        }
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.note-list li');

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: $('title').text(),
        link: `https://www.jianshu.com/u/${id}`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
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

    next();
};