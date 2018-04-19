const axios = require('axios');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    let tag = ctx.params.tag;
    let page = ctx.params.page;

    tag = (tag === undefined || tag === 'undefined') ? '' : tag;

    page = (page === undefined || page === 'undefined') ? '' : `/page/${page}`;

    const url = `http://www.mzitu.com/tag/${tag}${page}`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: url
        }
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#pins li');

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        lastBuildDate: new Date().toUTCString(),
        item: list && list.map((item, index) => {
            item = $(index);
            const linkA = item.find('a');
            const previewImg = linkA.find('img');
            return {
                title: previewImg.attr('alt'),
                description: `描述：${previewImg.attr('alt')}<br><img referrerpolicy="no-referrer" src="${previewImg.data('original')}">`,
                pubDate: new Date(item.find('.time').text()).toUTCString(),
                link: linkA.attr('href')
            };
        }).get(),
    });
};
