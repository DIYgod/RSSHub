// @ts-nocheck
import { config } from '@/config';

const parseArticle = require('./parse-article.js');
const { getUserCatalogMainContentQuery } = require('./graphql.js');

export default async (ctx) => {
    const user = ctx.req.param('user');
    const catalogId = ctx.req.param('catalogId');

    const cookie = config.medium.cookies[user];

    const catalog = await getUserCatalogMainContentQuery(user, catalogId, cookie);
    ctx.set('json', catalog);

    if (catalog && catalog.__typename === 'Forbidden') {
        throw new Error(`无权访问 id 为 ${catalogId} 的 List（可能是未设置 Cookie 或 Cookie 已过期）`);
    }
    if (!catalog || !catalog.itemsConnection) {
        throw new Error(`id 为 ${catalogId} 的 List 不存在`);
    }

    const name = catalog.name;
    const urls = catalog.itemsConnection.items.map((item) => item.entity.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    ctx.set('data', {
        title: `List: ${name}`,
        link: `https://medium.com/@${user}/list/${catalogId}`,
        item: parsedArticles,
    });
};
