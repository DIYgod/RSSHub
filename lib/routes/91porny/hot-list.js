const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://91porny.com/video/category/latest';

    const response = await got(`${host}`);
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const elems = $('div[class=video-elem]').slice().get();
    const items = elems.map((i) => {
        const item = $(i);
        const url = item.find('a').attr('href');
        const title = item.find('a').text();
        const description = item.find('a').html();
        const single = {
            title: title,
            description: description,
            link: 'https://91porny.com' + url,
        };
        return single;
    });

    ctx.state.data = {
        title: '91porny',
        link: 'https://91porny.com',
        item: items
    }
};
