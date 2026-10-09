import type { Route } from '@/types';

import { baseUrl, getItems, getLimit, getProducts, getProductType } from './utils';

export const route: Route = {
    path: '/store/:type?',
    name: '商店更新',
    categories: ['programming'],
    maintainers: ['DIYgod'],
    example: '/coze/store/project',
    parameters: {
        type: '内容类型：project（项目，默认）、agent（智能体）或 template（模板）。',
    },
    description: '订阅扣子中国站公开商店按上架时间排列的首屏内容。商品版本变化时会生成新的 GUID。模板包括智能体、工作流和项目模板。',
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'project';
    const { name, path } = getProductType(type);
    const limit = getLimit(ctx.req.query('limit'));
    const products = await getProducts(type, limit);

    return {
        title: `扣子 - ${name}商店更新`,
        link: `${baseUrl}${path}`,
        item: getItems(products),
    };
}
