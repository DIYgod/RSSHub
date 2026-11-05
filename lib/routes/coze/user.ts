import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { baseUrl, getItems, getLimit, getProducts, getProductType } from './utils';

export const route: Route = {
    path: '/user/:id/:type?',
    name: '创作者上架内容',
    categories: ['programming'],
    maintainers: ['DIYgod'],
    example: '/coze/user/4223666036440905/template',
    parameters: {
        id: '创作者公开主页 /user/ 后的数字 ID。',
        type: '内容类型：agent（智能体，默认）、project（项目）或 template（模板）。',
    },
    description: '订阅创作者公开上架内容的首屏更新，包括选定类型的智能体、项目或模板。商品版本变化时会生成新的 GUID。',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!/^\d+$/.test(id)) {
        throw new InvalidParameterError('Use the numeric creator ID from the Coze profile URL.');
    }
    const type = ctx.req.param('type') || 'agent';
    const { name } = getProductType(type);
    const limit = getLimit(ctx.req.query('limit'));
    const products = await getProducts(type, limit, id);
    const creator = products[0]?.meta_info.user_info?.name || id;

    return {
        title: `扣子 - ${creator}的${name}`,
        link: `${baseUrl}/user/${id}`,
        item: getItems(products),
    };
}
