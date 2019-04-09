const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const date = require('../../utils/date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await axios({
        method: 'get',
        url: `http://service.weibo.com/widget/widget_blog.php?uid=${uid}`,
        headers: {
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
    items.each((index, ele) => {
        wb = {};
        item = $(ele);
        titleEle = item.find('.wgtCell_txt');
        wb.title = titleEle.text().trim();
        if (wb.title === '') {
            wb.title = '[图片]';
        }
        wb.description = titleEle
            .html()
            .trim()
            .replace(/(\r\n|\r|\n)+/g, '<br>')
            .replace(/(( ?)+<br>( ?)+){2,}/g, '')
            .replace(/thumbnail/, 'large');
        wb.pubDate = date(item.find('.link_d').html(), 8);
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
