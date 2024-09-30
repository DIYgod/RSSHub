import { Route } from '@/types';
import parseList from './utils';

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/hafu/news/ggtz',
    parameters: { type: '分类，见下表（默认为 `ggtz`)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '河南财政金融学院',
    maintainers: [],
    handler,
    description: `| 校内公告通知 | 教务处公告通知 | 招生就业处公告通知 |
  | ------------ | -------------- | ------------------ |
  | ggtz         | jwc            | zsjyc              |`,
};

async function handler(ctx) {
    // set default router type
    const type = ctx.req.param('type') ?? 'ggtz';

    const { link, title, resultList } = await parseList(ctx, type);

    return {
        title,
        link,
        description: '河南财政金融学院 - 公告通知',
        item: resultList,
    };
}
