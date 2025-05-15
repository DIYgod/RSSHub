import { Route } from '@/types';
import parseList from './utils';

export const route: Route = {
    path: '/hf/notice/:type?',
    categories: ['university'],
    example: '/hfut/hf/notice/tzgg',
    parameters: { type: '分类，见下表（默认为 `tzgg`)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportRadar: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.hfut.edu.cn'],
        },
    ],
    name: '合肥校区通知',
    maintainers: ['batemax'],
    handler,
    description: `| 通知公告(https://news.hfut.edu.cn/tzgg2.htm) | 教学科研(https://news.hfut.edu.cn/tzgg2/jxky.htm) | 其他通知(https://news.hfut.edu.cn/tzgg2/qttz.htm) |
| ------------ | -------------- | ------------------ |
| tzgg         | jxky            | qttz              |`,
};

async function handler(ctx) {
    // set default router type
    const type = ctx.req.param('type') ?? 'tzgg';

    const { link, title, resultList } = await parseList(ctx, type);

    return {
        title,
        link,
        description: '合肥工业大学 - 通知公告',
        item: resultList,
    };
}
