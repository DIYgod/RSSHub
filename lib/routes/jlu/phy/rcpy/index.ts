import { Route } from '@/types';
import { handler } from '../handler';

export const route: Route = {
    path: '/phy/rcpy/:category/:column',
    categories: ['university'],
    example: '/jlu/phy/rcpy/bksjy/BKZX',
    radar: [
        {
            source: ['phy.jlu.edu.cn/rcpy/bksjy/BKZX'],
        },
    ],
    name: '吉林大学物理学院 - 本科生培养',
    maintainers: ['tongyz'],
    url: 'phy.jlu.edu.cn',
    handler: handler((ctx) => {
        const { category, column } = ctx.req.param();
        return `https://phy.jlu.edu.cn/rcpy/${category}/${column}.htm`;
    }),
};
