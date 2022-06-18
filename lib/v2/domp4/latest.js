const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.domp4.cc';
const latestUrl = 'https://www.domp4.cc/custom/update.html';

function getItemList($, type) {
    const list = $(`#${type} .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `${baseUrl}${item.find('a').attr('href')}`,
            };
        });
    return list;
}

module.exports = async (ctx) => {
    const { type = 'vod' } = ctx.params;
    const res = await got.get(latestUrl);
    const $ = cheerio.load(res.data);
    const list = getItemList($, type);

    ctx.state.data = {
        link: latestUrl,
        title: 'domp4电影',
        item: list,
    };
};
