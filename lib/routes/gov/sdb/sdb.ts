import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/sdb/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.art-list li a',
        list_include: 'site',
        title_element: '.title',
        title_match: '(.*)',
        description_element: '.text',
        author_element: '.source',
        author_match: '来源：(.*)发布时间',
        authorisme: '广东省茂名水东湾新城建设管理委员会网站',
        pubDate_element: '.source',
        pubDate_match: '发布时间：(.*)',
        pubDate_format: undefined,
    };
    await gdgov(info, ctx);
}
