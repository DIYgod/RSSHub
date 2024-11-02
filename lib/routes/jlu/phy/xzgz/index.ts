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
    name: '物理学院 - 行政工作',
    maintainers: ['tsurumi-yizhou'],
    url: 'phy.jlu.edu.cn',
    description: `
:::tip
Provided In 行政工作：
- 通知公告: [/jlu/phy/xzgz/tzgg](https://phy.jlu.edu.cn/xzgz/tzgg.htm)
- 学院新闻: [/jlu/phy/xzgz/xyxw](https://phy.jlu.edu.cn/xzgz/xyxw.htm)
- 学院文件: [/jlu/phy/xzgz/xywj](https://phy.jlu.edu.cn/xzgz/xywj.htm)
:::
    `,
    handler: handler((ctx) => {
        const { category } = ctx.req.param();
        return `https://phy.jlu.edu.cn/xzgz/${category}.htm`;
    }),
};
