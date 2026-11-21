import type { Route } from '@/types';

import { baseUrl, fetchItems } from './utils';

export const route: Route = {
    path: '/physics-school-announcements',
    categories: ['university'],
    example: '/scnu/physics-school-announcements',
    radar: [
        {
            source: ['physics.scnu.edu.cn/NEWS/Notices/*'],
        },
    ],
    name: '物理学院通知',
    maintainers: ['Shinonome28'],
    handler,
    url: 'physics.scnu.edu.cn/NEWS/Notices/',
};

async function handler() {
    const items = await fetchItems({
        党政: 'NEWS/Notices/PartyAndGovernment/',
        教务: 'NEWS/Notices/Education/',
        科研: 'NEWS/Notices/Research/',
        人事: 'NEWS/Notices/People/',
        综合: 'NEWS/Notices/General/',
        学工: 'NEWS/Notices/Students/',
    });

    return {
        title: '华南师范大学物理学院通知',
        link: `${baseUrl}/NEWS/Notices/`,
        item: items,
    };
}
