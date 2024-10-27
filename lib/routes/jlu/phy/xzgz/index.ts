import { Route } from '@/types';
import { handler } from '../handler';

export const route: Route = {
    path: '/phy/xzgz/:category',
    categories: ['university'],
    example: '/jlu/phy/xzgz/tzgg',
    radar: [
        {
            source: ['phy.jlu.edu.cn/xzgz/tzgg'],
        },
    ],
    name: '吉林大学物理学院 - 通知公告',
    maintainers: ['tongyz'],
    url: 'phy.jlu.edu.cn',
    handler: handler((ctx) => {
        const { category } = ctx.req.param();
        return `https://phy.jlu.edu.cn/xzgz/${category}.htm`;
    }),
};
