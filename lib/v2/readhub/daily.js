const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, processItems } = require('./util');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 11;

    const currentUrl = new URL('daily', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const dailyItems = JSON.parse(currentResponse.match(/\{\\"daily\\":(.*?),\\"ts\\":\d+/)[1].replace(/\\"/g, '"'));

    let items = dailyItems.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`topic/${item.uid}`, rootUrl).href,
        guid: item.uid,
    }));

    items = await processItems(items, ctx.cache.tryGet);

    const $ = cheerio.load(currentResponse);

    const author = $('meta[name="application-name"]').prop('content');
    const subtitle = $('meta[property="og:title"]').prop('content');
    const image = 'https://readhub-oss.nocode.com/static/readhub.png';
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl);

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};
