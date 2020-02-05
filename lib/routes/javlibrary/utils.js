const url = require('url');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

// 通过传入不同的ctx.state.data.link 返回javlibrary 不同link的rss
module.exports = async function template(ctx) {
    const link = ctx.state.data.link;
    const response = await cloudscraper.get(link);
    const $ = cheerio.load(response);
    const list = $('.videothumblist .video').get();

    const items = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const itemLink = url.resolve(link, item.find('a').attr('href'));
            const simple = {
                title: `[${item.find('.id').text()}]${item.find('.title').text()}`,
                link: itemLink,
            };

            const details = await ctx.cache.tryGet(itemLink, async () => {
                const response = await cloudscraper.get(itemLink);
                const $ = cheerio.load(response);
                $('#video_info #video_review .icon').remove();
                return {
                    author: $('.star').text(),
                    description: `<img src="${$('#video_jacket_img').attr('src')}"><br>${$('#video_info').html()}`,
                };
            });
            return Promise.resolve(Object.assign({}, simple, details));
        })
    );

    ctx.state.data = {
        title: `Javlibrary - ${$('.boxtitle').text()}`,
        link: link,
        item: items,
    };
};
