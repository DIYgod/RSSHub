import type { Data, Route } from '@/types';

import { fetchFeed } from './utils';

const categoryMap = {
    bkspy: { name: '本科生培养', code: 'notice-xssw-bkspy' },
    yjspy: { name: '研究生培养', code: 'notice-xssw-yjspy' },
    gjjl: { name: '国际交流', code: 'notice-xssw-gjjl' },
    djdy: { name: '党建德育', code: 'notice-xssw-djdy' },
    txgz: { name: '团学工作', code: 'notice-xssw-txgz' },
    zyfz: { name: '职业发展', code: 'notice-xssw-zyfz' },
    qt: { name: '其他', code: 'notice-xssw-qt' },
};

export const route: Route = {
    path: '/cs/tzgg/:category',
    categories: ['university'],
    example: '/sjtu/cs/tzgg/bkspy',
    parameters: { category: '通知类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: Object.entries(categoryMap).map(([key, { code }]) => ({
        source: [`www.cs.sjtu.edu.cn/${code}.html`],
        target: `/cs/tzgg/${key}`,
    })),
    name: '计算机学院 - 通知公告',
    maintainers: ['BeaCox'],
    handler,
    url: 'www.cs.sjtu.edu.cn/notice-xssw-bkspy.html',
    description: `仅包含官网未登录时可见的公开通知。分类没有公开通知时无法生成订阅。

| 本科生培养 | 研究生培养 | 国际交流 | 党建德育 | 团学工作 | 职业发展 | 其他 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | ---- |
| bkspy      | yjspy      | gjjl     | djdy     | txgz     | zyfz     | qt   |`,
};

function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category');
    const cat = categoryMap[category];
    if (!cat) {
        throw new Error(`Unknown category: ${category}. Valid: ${Object.keys(categoryMap).join(', ')}`);
    }

    return fetchFeed(cat.code, `通知公告 - ${cat.name}`);
}
