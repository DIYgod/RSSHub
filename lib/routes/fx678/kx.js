const cheerio = require('cheerio');
const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const url = 'https://kx.fx678.com/';
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const list = $('.body_zb ul .body_zb_li');
    // 爬取页面的前30条消息
    const content = list
        .slice(0, 30)
        .map(function() {
            const title = $(this)
                .find('.zb_time')
                .text();
            const description = $(this)
                .find('.zb_word')
                .text()
                .replace(/(^\s*)|(\s*$)/g, '');
            const item = {
                title,
                description,
            };
            return item;
        })
        .get();

    ctx.state.data = {
        title: '7x24小时快讯',
        link: url,
        item: content,
    };
};
