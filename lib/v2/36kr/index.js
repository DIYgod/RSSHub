const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl, ProcessItem } = require('./utils');

const shortcuts = {
    '/information': '/information/web_news',
    '/information/latest': '/information/web_news',
    '/information/recommend': '/information/web_recommend',
    '/information/life': '/information/happy_life',
    '/information/estate': '/information/real_estate',
    '/information/workplace': '/information/web_zhichang',
};

module.exports = async (ctx) => {
    const path = ctx.path.replace(/^\/news(?!flashes)/, '/information').replace(/\/search\/article/, '/search/articles');

    const currentUrl = `${rootUrl}${shortcuts.hasOwnProperty(path) ? shortcuts[path] : path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const data = JSON.parse(response.data.match(/"itemList":(\[.*?\])/)[1]);

    let items = data
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .filter((item) => item.itemType !== 0)
        .map((item) => {
            item = item.templateMaterial ?? item;
            return {
                title: item.widgetTitle.replace(/<\/?em>/g, ''),
                author: item.author,
                pubDate: parseDate(item.publishTime),
                link: `${rootUrl}/${path === '/newsflashes' ? 'newsflashes' : 'p'}/${item.itemId}`,
                description: item.widgetContent ?? item.content,
            };
        });

    if (!/^\/(search|newsflashes)/.test(path)) {
        items = await Promise.all(items.map((item) => ProcessItem(item, ctx.cache.tryGet)));
    }

    ctx.state.data = {
        title: `36氪 - ${$('title').text().split('_')[0]}`,
        link: currentUrl,
        item: items,
    };
};
