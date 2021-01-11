const cheerio = require('cheerio');
const got = require('@/utils/got');

const host = 'https://ja.porn-images-xxx.com/';

exports.processFeed = async function processFeed(ctx, link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.body);
    const list = $('ul#image-list li')
        .map(function (index, item) {
            item = $(item);
            return {
                title: item.find('.image-list-item-title').text(),
                link: item.find('.image-list-item-title > a').attr('href'),
                date: item.find('.image-list-item-regist-date > span').text(),
            };
        })
        .get();
    return await Promise.all(
        list.map(async (info) => {
            const title = info.title.trim();
            const date = info.date;
            const itemUrl = host + info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const images = $('.icon-overlay > a > img');
            const desc = cheerio.html(images);
            const item = {
                title: title,
                link: itemUrl,
                description: desc,
                pubDate: new Date(date).toUTCString(),
            };
            if (desc) {
                ctx.cache.set(itemUrl, JSON.stringify(item));
            }
            return Promise.resolve(item);
        })
    );
};
