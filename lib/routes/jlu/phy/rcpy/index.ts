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
    name: '物理学院 - 人才培养',
    maintainers: ['tsurumi-yizhou'],
    url: 'phy.jlu.edu.cn',
    description: `
:::tip
Provided In 人才培养:
- 本科生培养:
    + 本科资讯：[/jlu/phy/rcpy/bksjy/BKZX](https://phy.jlu.edu.cn/rcpy/bksjy/BKZX.htm)
    + 教育思想大讨论：[/jlu/phy/rcpy/bksjy/jysxdtlxlhd](https://phy.jlu.edu.cn/rcpy/bksjy/jysxdtlxlhd.htm)
    + 培养方案：[/jlu/phy/rcpy/bksjy/pyfa](https://phy.jlu.edu.cn/rcpy/bksjy/pyfa.htm)
- 研究生培养：
    + 教学通知：[/jlu/phy/rcpy/yjsjy/jxtz](https://phy.jlu.edu.cn/rcpy/yjsjy/jxtz.htm)
:::
    `,
    handler: handler((ctx) => {
        const { category, column } = ctx.req.param();
        return `https://phy.jlu.edu.cn/rcpy/${category}/${column}.htm`;
    }),
};
