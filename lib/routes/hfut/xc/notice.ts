import { Route } from '@/types';
import parseList from './utils';

export const route: Route = {
    path: '/xc/notice/:type?',
    categories: ['university'],
    example: '/hfut/xc/notice/tzgg',
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
            source: ['xc.hfut.edu.cn'],
        },
    ],
    name: '宣城校区通知',
    maintainers: ['batemax'],
    handler,
    description: `| 通知公告(https://xc.hfut.edu.cn/1955/list.htm) | 院系动态-工作通知(https://xc.hfut.edu.cn/gztz/list.htm) |
  | ------------ | -------------- |
  | tzgg         | gztz           |`,
};

async function handler(ctx) {
    // set default router type
    const type = ctx.req.param('type') ?? 'tzgg';

    const { link, title, resultList } = await parseList(ctx, type);

    return {
        title,
        link,
        description: '合肥工业大学宣城校区 - 通知公告',
        item: resultList,
    };
}
