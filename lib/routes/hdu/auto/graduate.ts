import { Route } from '@/types';
import { fetchAutoNews } from './utils';

export const route: Route = {
    path: '/auto/graduate',
    categories: ['university'],
    example: '/hdu/auto/graduate',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '自动化学院 - 研究生教育通知',
    maintainers: ['jalenzz'],
    handler: () => fetchAutoNews('3754/list.htm', '研究生教育'),
    description: '杭州电子科技大学自动化学院研究生教育',
    radar: [
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3754/list.htm'],
            target: '/auto/graduate',
        },
    ],
};
