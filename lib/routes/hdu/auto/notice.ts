import { Route } from '@/types';
import { fetchAutoNews } from './utils';

export const route: Route = {
    path: '/auto',
    categories: ['university'],
    example: '/hdu/auto',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '自动化学院 - 通知公告',
    maintainers: ['jalenzz'],
    handler: () => fetchAutoNews('3779/list.htm', '通知公告'),
    description: '杭州电子科技大学自动化学院通知公告',
    radar: [
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3779/list.htm'],
            target: '/auto',
        },
    ],
};
