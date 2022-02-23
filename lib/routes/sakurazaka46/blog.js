const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://sakurazaka46.com/s/s46/diary/blog',
        headers: {
            Referer: 'https://sakurazaka46.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('ul.com-blog-part li');
    let itemPicUrl;

    ctx.state.data = {
        allowEmpty: true,
        title: '櫻坂46 公式ブログ',
        link: 'https://sakurazaka46.com/s/s46/diary/blog',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('div.wrap-bg span.img').attr('style').replace('background-image: url(', '').replace(');', '');
                    return {
                        title: item.find('div.date-title h3.title').text().trim(),
                        link: item.find('a').first().attr('href'),
                        pubDate: item.find('div.date-title p.date').text(),
                        author: item.find('div.prof-in p.name').text().trim(),
                        description: `<img src="${itemPicUrl}">`,
                    };
                })
                .get(),
    };
};
