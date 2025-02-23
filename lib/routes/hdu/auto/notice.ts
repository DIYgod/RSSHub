import { Route } from '@/types';
import { fetchAutoNews } from './utils';
import logger from '@/utils/logger';

const typeMap = {
    notice: {
        name: '通知公告',
        path: '3779/list.htm',
    },
    graduate: {
        name: '研究生教育',
        path: '3754/list.htm',
    },
    undergraduate: {
        name: '本科教学',
        path: '3745/list.htm',
    },
    student: {
        name: '学生工作',
        path: '3726/list.htm',
    },
};

export const route: Route = {
    path: '/auto/:type?',
    categories: ['university'],
    example: '/hdu/auto',
    parameters: { type: '分类，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '自动化学院',
    maintainers: ['jalenzz'],
    handler: (ctx) => {
        let type = ctx.req.param('type') || 'notice';
        if (!(type in typeMap)) {
            logger.error(`Invalid type: ${type}. Valid types are: ${Object.keys(typeMap).join(', ')}, defaulting to notice`);
            type = 'notice';
        }
        return fetchAutoNews(typeMap[type].path, typeMap[type].name);
    },
    description: `| 通知公告  | 研究生教育 |    本科教学    | 学生工作  |
| -------- | -------- |   --------    | -------- |
| notice   | graduate | undergraduate | student  |`,
    radar: [
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3779/list.htm'],
            target: '/auto/notice',
        },
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3754/list.htm'],
            target: '/auto/graduate',
        },
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3745/list.htm'],
            target: '/auto/undergraduate',
        },
        {
            source: ['auto.hdu.edu.cn/main.htm', 'auto.hdu.edu.cn/3726/list.htm'],
            target: '/auto/student',
        },
    ],
};
