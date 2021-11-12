const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.hinatazaka46.com/s/official/diary/member',
        headers: {
            Referer: 'http://www.hinatazaka46.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.p-blog-top__contents ul li');
    let itemPicUrl;

    ctx.state.data = {
        allowEmpty: true,
        title: '日向坂46官网 博客',
        link: 'https://www.hinatazaka46.com/s/official/diary/member',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('div.c-blog__image').attr('style').replace('background-image:url(', '').replace(');', '');
                    return {
                        title: item.find('p.c-blog-top__title').text().trim(),
                        link: item.find('a').first().attr('href'),
                        pubDate: item.find('time.c-blog-top__date').text(),
                        author: item.find('div.c-blog-top__name').text().trim(),
                        description: `<img src="${itemPicUrl}">`,
                    };
                })
                .get(),
    };
};
