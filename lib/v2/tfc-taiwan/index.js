const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, parseList, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const requestPath = ctx.request.path;
    const isTopic = requestPath.startsWith('/topic/');
    let link = baseUrl;

    if (isTopic) {
        link += `/topic/${ctx.params.id}`;
    } else if (requestPath === '/') {
        link += `/articles/report`;
    } else {
        link += `/articles${requestPath}`;
    }

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const list = $(`${isTopic ? '.view-grouping' : '.pane-clone-of-article'} .views-row-inner`)
        .toArray()
        .map((item) => parseList($(item)));

    const items = await parseItems(list, ctx.cache.tryGet);

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: $('head meta[property="og:image"]').attr('content'),
        logo: $('head link[rel="shortcut icon"]').attr('href'),
        icon: $('head link[rel="shortcut icon"]').attr('href'),
        link,
        item: items,
    };
};
