const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let host = 'http://galaxylab.com.cn/';

    host = `${host}/posts/`;

    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const list = $('#scroll > section > ul > li');

    ctx.state.data = {
        title: '平安银河实验室',
        link: 'http://galaxylab.com.cn/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('article > a[title]').attr('title'),
                        link: item.find('article > a[title]').attr('href'),
                        description: item.find('article > div.excerpt').text(),
                        pubDate: new Date(item.find('article > div.postinfo > div.left > span.date > b').text().replace('日', '').replaceAll(/\D/g, '-')).toUTCString(),
                        author: item.find('article > div.postinfo > div.left > span.author > a[title]').attr('title'),
                    };
                })
                .get(),
    };
};

// 虽然有很多分类，但是更新不勤，就不写分类了。
