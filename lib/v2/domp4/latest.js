const got = require('@/utils/got');
const cheerio = require('cheerio');

const { ensureDomain } = require('./utils');

function getItemList($, type, hostUrl) {
    const list = $(`#${type} .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `${hostUrl}${item.find('a').attr('href')}`,
            };
        });
    return list;
}

module.exports = async (ctx) => {
    const { type = 'vod' } = ctx.params;
    const { domain } = ctx.query;

    const hostUrl = ensureDomain(ctx, domain);
    const latestUrl = `${hostUrl}/custom/update.html`;

    const res = await got.get(latestUrl);
    const $ = cheerio.load(res.data);
    const list = getItemList($, type, hostUrl);

    ctx.state.data = {
        link: latestUrl,
        title: 'domp4电影',
        item: list,
    };
};
