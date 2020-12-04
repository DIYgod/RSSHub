const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://getpocket.com/explore/trending';

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('article').get();
    ctx.state.data = {
        title: 'Trending on Pocket',
        description: 'Top Articles and Videos about Trending on Pocket',
        link: url,
        item: list.map((item) => {
            item = $(item);
            const middle_link = new URL(item.find('a').first().attr('href'));
            const media = item
                .find('.media')
                .attr('style')
                .match(/url\('(.*?)'\);/)[1];
            const pic_html = media ? `<img src="${media}">` : '';
            return {
                title: item.find('.title').text(),
                author: item.find('.details > span').first().text(),
                description: `<p>${item.find('.excerpt').text()}</p>` + pic_html,
                link: middle_link.searchParams.get('url') || middle_link.href,
            };
        }),
    };
};
