const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');
const weiboUtils = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await axios({
        method: 'get',
        url: `http://service.weibo.com/widget/widget_blog.php?uid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `http://service.weibo.com/widget/widget_blog.php?uid=${uid}`,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data, {
        decodeEntities: false,
    });
    const wbs = [];
    const items = $('.wgtCell');
    let wb, item, titleEle;
    items.forEach((index, ele) => {
        wb = {};
        item = $(ele);
        titleEle = item.find('.wgtCell_txt');
        wb.title = titleEle.text().replace(/^\s+|\s+$/g, '');
        if (wb.title.length > 24) {
            wb.title = wb.title.slice(0, 24) + '...';
        }
        wb.description = titleEle
            .html()
            .replace(/^\s+|\s+$/g, '')
            .replace(/thumbnail/, 'large');
        wb.pubDate = weiboUtils.getTime(item.find('.link_d').html());
        wb.link = item.find('.wgtCell_tm a').attr('href');
        wbs.push(wb);
    });
    const name = $('.userNm').text();

    ctx.state.data = {
        title: `${name}的微博`,
        link: `http://weibo.com/${uid}/`,
        item: wbs,
    };
};
