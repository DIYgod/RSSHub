import { Route } from '@/types';
import { fetchAutoNews } from './utils';

export const route: Route = {
    path: '/auto/undergraduate',
    categories: ['university'],
    example: '/hdu/auto/undergraduate',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '自动化学院 - 本科教学',
    maintainers: ['jalenzz'],
    handler: () => fetchAutoNews('3745/list.htm', '本科教学'),
    description: '杭州电子科技大学自动化学院本科教学',
    radar: [
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3745/list.htm'],
            target: '/auto/undergraduate',
        },
    ],
};
