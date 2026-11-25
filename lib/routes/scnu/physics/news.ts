import type { Route } from '@/types';

import { baseUrl, fetchItems } from './utils';

export const route: Route = {
    path: '/physics-school-news',
    categories: ['university'],
    example: '/scnu/physics-school-news',
    radar: [
        {
            source: ['physics.scnu.edu.cn/NEWS/News/*'],
        },
    ],
    name: '物理学院新闻动态',
    maintainers: ['Shinonome28'],
    handler,
    url: 'physics.scnu.edu.cn/NEWS/News/',
};

async function handler() {
    const items = await fetchItems({
        学院新闻: 'NEWS/News/College/',
        教务新闻: 'NEWS/News/Education/',
        学工新闻: 'NEWS/News/Students/',
        科研新闻: 'NEWS/News/Research/',
        院友新闻: 'NEWS/News/People/',
    });

    return {
        title: '华南师范大学物理学院新闻动态',
        link: `${baseUrl}/NEWS/News/`,
        item: items,
    };
}
