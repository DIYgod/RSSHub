const { rootUrl, parseNewsList, parseArticle } = require('./utils');
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    const defaultPath = '/yaowenn/';

    let pathname = ctx.path.replace(/(^\/ccdi|\/$)/g, '');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseNewsList(currentUrl, '.list_news_dl li', ctx);
    const items = [];
    for await (const item of asyncPool(1, list, (item) => parseArticle(item, ctx))) {
        items.push(item);
    }

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
