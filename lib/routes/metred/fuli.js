const got = require('@/utils/got');
const host = 'https://met.red';
const mainPage = 'https://met.red/h/weal/list#';
const cheerio = require('cheerio');
const url = require('url');

async function load(link, ctx) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return cache;
    }
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const images = $('img');
    for (let k = 0; k < images.length; k++) {
        $(images[k]).replaceWith(`<img src="${url.resolve(host, $(images[k]).attr('src'))}" />`);
    }
    const couponUrl = $('.layui-btn.layui-btn.layui-btn-lg').attr('href');

    const eventHtml = couponUrl ? '<div><p>活动链接:无</p></div>' : `<div><a href="${couponUrl}">点我前往活动</a></div>`;

    const description = eventHtml + $('.p-detail-html').html();
    ctx.cache.set(link, description);
    return { description };
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: mainPage,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('h4 > a').get();
    const process = await Promise.all(
        list.map(async (item) => {
            const itemUrl = host + $(item).attr('href');
            const single = {
                title: $(item).text(),
                link: itemUrl,
                guid: itemUrl,
            };
            const other = await load(itemUrl, ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: '福利资源-met.red',
        link: mainPage,
        description: '福利资源更新提醒',
        item: process,
    };
};
