const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const url = require('url');

module.exports = async (ctx) => {
    const link = 'http://www.javlibrary.com/cn/vl_bestrated.php';
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
        title: `Javlibrary - 评价最高的影片`,
        link: link,
        item: items,
    };
};
