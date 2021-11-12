const cheerio = require('cheerio');
const got = require('@/utils/got');

const host = 'https://ja.porn-images-xxx.com/';

exports.processFeed = async function processFeed(ctx, link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.body);
    const list = $('ul#image-list li')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('.image-list-item-title').text(),
                link: item.find('.image-list-item-title > a').attr('href'),
                date: item.find('.image-list-item-regist-date > span').text(),
            };
        })
        .get();
    return Promise.all(
        list.map(async (info) => {
            const title = info.title.trim();
            const date = info.date;
            const itemUrl = host + 'story' + info.link.replace('/image', '');

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const images = $('amp-img')
                .map((index, element) => {
                    element = $(element);
                    const img_src = element.attr('src');
                    return `<img src=${img_src} referrerpolicy="no-referrer" alt="">`;
                })
                .get()
                .join(' ');
            const item = {
                title,
                link: itemUrl,
                description: images,
                pubDate: new Date(date).toUTCString(),
            };
            if (images) {
                ctx.cache.set(itemUrl, JSON.stringify(item));
            }
            return Promise.resolve(item);
        })
    );
};
