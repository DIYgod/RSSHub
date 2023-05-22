const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
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
            const tags = item.find('.tag-info-list').children();
            const taginfo = tags.map((i, elem) => $(elem).text()).get();
            return {
                title: item.attr('title'),
                link: `${host}${item.attr('href')}`,
                description: art(path.join(__dirname, 'templates/description.art'), { itemPicUrl, taginfo }),
            };
        });

    ctx.state.data = {
        title: `月幕 Galgame - 本月新作`,
        link: `${host}/release-list/${year}/${month}`,
        description: '月幕 Galgame - 本月新作',
        item: items,
    };
};
