import { Route } from '@/types';
import { fetchAutoNews } from './utils';

export const route: Route = {
    path: '/auto/student',
    categories: ['university'],
    example: '/hdu/auto/student',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '自动化学院 - 学生工作',
    maintainers: ['jalenzz'],
    handler: () => fetchAutoNews('3726/list.htm', '学生工作'),
    description: '杭州电子科技大学自动化学院学生工作',
    radar: [
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3726/list.htm'],
            target: '/auto/student',
        },
    ],
};
