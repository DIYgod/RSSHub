import type { Route } from '@/types';

import { baseUrl, fetchItems } from './utils';

export const route: Route = {
    path: '/physics-school-research-news',
    categories: ['university'],
    example: '/scnu/physics-school-research-news',
    radar: [
        {
            source: ['physics.scnu.edu.cn/RESEARCH/*'],
        },
    ],
    name: '物理学院科学研究动态',
    maintainers: ['Shinonome28'],
    handler,
    url: 'physics.scnu.edu.cn/RESEARCH/',
};

async function handler() {
    const items = await fetchItems({
        学术报告: 'RESEARCH/EVENTS/Seminars/',
        学术会议: 'RESEARCH/EVENTS/Conferences/',
        重大项目: 'RESEARCH/Projects/',
        科研成果: 'RESEARCH/Achievements/',
    });

    return {
        title: '华南师范大学物理学院科学研究动态',
        link: `${baseUrl}/RESEARCH/`,
        item: items,
    };
}
