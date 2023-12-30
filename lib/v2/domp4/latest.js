const got = require('@/utils/got');
const cheerio = require('cheerio');

const { defaultDomain, ensureDomain } = require('./utils');

function getItemList($, type) {
    const list = $(`#${type} .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `https://${defaultDomain}${item.find('a').attr('href')}`, // fixed domain for guid
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
    const list = getItemList($, type);

    ctx.state.data = {
        link: latestUrl,
        title: 'domp4电影',
        item: list,
    };
};
