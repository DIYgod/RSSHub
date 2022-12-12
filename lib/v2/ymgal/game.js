const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.ymgal.games';

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${host}/release-list/${year}/${month}`,
    });

    const $ = cheerio.load(response.data);
    const list = $('.game-view-card').toArray();

    const items =
        list &&
        list.map((item) => {
            item = $(item);
            const itemPicUrl = item.find('.lazy').first().attr('data-original');
            let info = '<ul>';
            let tags = item.find('.ant-tag');
            let tagslength = tags.length;
            while (tagslength) {
                info += `<li>${tags.first().text()}</li>`;
                tags = tags.next();
                tagslength--;
            }
            info += '</ul>';
            return {
                title: item.attr('title'),
                link: `${host}${item.attr('href')}`,
                description: `<img src="${itemPicUrl}">${info}`,
            };
        });

    ctx.state.data = {
        title: `月幕 Galgame - ${month} 月新作`,
        link: `${host}/release-list/${year}/${month}`,
        description: '月幕 Galgame - ${month} 月新作',
        item: items,
    };
};
