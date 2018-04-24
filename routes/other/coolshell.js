const axios = require('axios');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://coolshell.cn',
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://coolshell.cn'
        }
    });

    const data = response.data;

    const $ = cheerio.load(data);
    //const list = $('.note-list li');
    const list = $('.site-main article');

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: '酷壳',
        link: 'https://coolshell.cn',
        description: $('meta[name="description"]').attr('content'),
        lastBuildDate: new Date().toUTCString(),
        item: list && list.map((index, item) => {
            item = $(item);
            return {
                title: item.find('.entry-title').text(),
                description: `作者：${item.find('.url.fn').text()}<br>描述：${item.find('.entry-content').children().first().text()}<br><img referrerpolicy="no-referrer" src="${item.find('[srcset]').attr('src')}">`,
                pubDate: new Date(item.find('[datetime]').attr('datetime')).toUTCString(),
                link: item.find('.btn.btn-default').attr('href')
            };
        }).get(),
    });
};
