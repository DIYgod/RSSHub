const { rootUrl, parseNewsList, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const defaultPath = '/yaowenn/';

    let pathname = ctx.path.replace(/(^\/ccdi|\/$)/g, '');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseNewsList(currentUrl, '.list_news_dl li', ctx);
    const items = await Promise.all(list.map((item) => parseArticle(item, ctx)));

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
