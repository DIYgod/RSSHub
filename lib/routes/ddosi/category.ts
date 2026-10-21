import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getFirstPage } from './utils';

export const route: Route = {
    path: '/category/:category?',
    categories: ['blog'],
    example: '/ddosi/category/黑客工具',
    parameters: { category: '分类名称，可在分类页面 URL 中找到，例如黑客工具' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ddosi.org/category/:category/'],
            target: '/category/:category',
        },
    ],
    name: '分类',
    maintainers: ['XinRoom'],
    handler,
    url: 'ddosi.org/',
};

async function handler(ctx) {
    const url = 'https://www.ddosi.org/category';
    const category = ctx.req.param('category');
    if (!category) {
        throw new InvalidParameterError('Specify a category name, for example /ddosi/category/黑客工具.');
    }
    const items = await getFirstPage(`${url}/${category}/`);

    return {
        title: `雨苁-${category}`,
        link: `${url}/${category}/`,
        item: items,
    };
}
