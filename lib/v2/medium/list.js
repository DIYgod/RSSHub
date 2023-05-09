const config = require('@/config').value;

const parseArticle = require('./parse-article.js');
const { getUserCatalogMainContentQuery } = require('./graphql.js');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const catalogId = ctx.params.catalogId;

    const cookie = config.medium.cookies[user];

    const catalog = await getUserCatalogMainContentQuery(user, catalogId, cookie);
    ctx.state.json = catalog;

    if (catalog && catalog.__typename === 'Forbidden') {
        throw Error(`无权访问 id 为 ${catalogId} 的 List（可能是未设置 Cookie 或 Cookie 已过期）`);
    }
    if (!catalog || !catalog.itemsConnection) {
        throw Error(`id 为 ${catalogId} 的 List 不存在`);
    }

    const name = catalog.name;
    const urls = catalog.itemsConnection.items.map((item) => item.entity.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    ctx.state.data = {
        title: `List: ${name}`,
        link: `https://medium.com/@${user}/list/${catalogId}`,
        item: parsedArticles,
    };
};
