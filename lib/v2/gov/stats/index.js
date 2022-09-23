const { parseContList, parseXilan } = require('./utils');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.stats.gov.cn';
    const defaultPath = '/tjsj/zxfb/';

    let pathname = ctx.path.replace(/(^\/stats|\/$)/g, '');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseContList(currentUrl, 'ul.center_list_contlist li a:not([id])', ctx);
    const items = await Promise.all(list.map((item) => parseXilan(item, ctx)));

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
