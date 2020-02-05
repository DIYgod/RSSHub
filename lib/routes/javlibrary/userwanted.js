const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const url = require('url');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `http://www.javlibrary.com/cn/userwanted.php?u=${uid}`;

    const response = await cloudscraper.get(link);
    const $ = cheerio.load(response);
    const list = $('.videothumblist .video')
        .slice(0, 8)
        .get();

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
        title: `Javlibrary - ${uid} 想要的影片清单`,
        link: link,
        item: items,
    };
};
