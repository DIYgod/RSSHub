const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');
const host = 'https://kx.fx678.com/';

module.exports = async (ctx) => {
    const link = 'https://kx.fx678.com/';
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    // 页面新闻消息列表
    const list = $('.body_zb ul .body_zb_li .zb_word')
        .find('.list_font_pic > a:first-child')
        .map((i, e) => $(e).attr('href'))
        .slice(0, 30)
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const absoluteUrl = url.resolve(host, itemUrl);
            const cache = await ctx.cache.get(absoluteUrl);
            // 判断缓存
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(absoluteUrl);
            const $ = cheerio.load(res.data);

            const item = {
                title: $('.article-cont h1').text(),
                link: absoluteUrl,
                description: $('.article-main .content').html(),
                pubDate: new Date().toUTCString(),
            };
            ctx.cache.set(absoluteUrl, JSON.stringify(item));

            return item;
        })
    );
    ctx.state.data = {
        title: '7x24小时快讯',
        link,
        item: out,
    };
};
