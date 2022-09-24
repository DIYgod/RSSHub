/* eslint-disable no-await-in-loop */
const { rootUrl, parseNewsList, parseArticle } = require('./utils');

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

module.exports = async (ctx) => {
    const defaultPath = '/yaowenn/';

    let pathname = ctx.path.replace(/(^\/ccdi|\/$)/g, '');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseNewsList(currentUrl, '.list_news_dl li', ctx);
    const items = [];

    for (const item of list) {
        items.push(await parseArticle(item, ctx));
        // sleep randomly for anti rate limit on ccdi site
        await new Promise((r) => setTimeout(r, getRandomInt(1000, 2500)));
    }

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
