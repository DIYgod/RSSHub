const { parseContList, parseXilan } = require('./utils');

module.exports = async (ctx) => {
    ctx.path = ctx.path.replace(/^\/stats/g, '');

    const rootUrl = 'http://www.stats.gov.cn';
    const pathname = ctx.path === '/' ? '/tjsj/zxfb/' : `${ctx.path}/`;
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseContList(currentUrl, 'ul.center_list_contlist li a:not([id])', ctx);
    const items = await Promise.all(list.map((item) => parseXilan(item, ctx)));

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
