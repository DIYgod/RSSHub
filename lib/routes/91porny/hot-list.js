const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://91porny.com/video'

    const response = await got(`${host}`);
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const item = $('div[class=video-elem]')[0].find('a');

    ctx.state.data = {
        title: '91porny',
        link: 'https://91porny.com',
        item: items.map((item) => ({
            title: `${item[1].text()}`,
            description: item[0].find().html(),
            link: `https://91porny.com${item[1].href}`,
        })),
    };
}