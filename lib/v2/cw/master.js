const cheerio = require('cheerio');
const { baseUrl, cookieJar, got, parseList, parseItems, getCookie } = require('./utils');

module.exports = async (ctx) => {
    const { channel } = ctx.params;
    const pageUrl = `${baseUrl}/masterChannel.action`;
    if (!cookieJar) {
        await getCookie();
    }
    const { data: response } = await got(pageUrl, {
        headers: {
            Referer: baseUrl,
        },
        cookieJar,
        searchParams: {
            idMasterChannel: channel,
        },
    });
    const $ = cheerio.load(response);

    const list = parseList($, ctx.query.limit ? Number(ctx.query.limit) : 100);
    const items = await parseItems(list, ctx.cache.tryGet);

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    };
};
