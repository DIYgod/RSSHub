const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.keyakizaka46.com/s/k46o/diary/member',
        headers: {
            Referer: 'http://www.keyakizaka46.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.box-newposts div.slider ul li');
    let itemPicUrl;

    ctx.state.data = {
        allowEmpty: true,
        title: '欅坂46官网 博客',
        link: 'https://www.keyakizaka46.com/s/k46o/diary/member',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = `${item.find('img.js-replaceImage').attr('src')}`;
                    return {
                        title: item.find('p.ttl').text().trim(),
                        link: item.find('a').first().attr('href'),
                        pubDate: item.find('div.box-blog time').text(),
                        author: item.find('p.ttl').next().text().trim(),
                        description: `<img src="${itemPicUrl}">`,
                    };
                })
                .get(),
    };
};
