// Warning: The author still knows nothing about javascript!
import type { Route } from '@/types';
import cache from '@/utils/cache';

import { getArticle, getNotifByPage } from './_utils';

export const route: Route = {
    path: '/sem/:type?',
    categories: ['university'],
    example: '/tongji/sem/notice',
    parameters: { type: '通知类型，默认为 `notice`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '经济与管理学院通知',
    maintainers: ['sitdownkevin'],
    url: 'sem.tongji.edu.cn/semch',
    handler,
    description: `| 学院通知 | 招生通知 | 学术观点 | 新闻 | 活动 | 视点 | 教师与行政人员招聘 |
| -------- | -------------- | ------------------ | ---- | ---------- | --------- | ------------------ |
| notice   | enrollment     | academic-paper     | news | events     | focus     | collegerecruitment |
`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'notice';
    const subType = new Set(['enrollment', 'academic-paper', 'news', 'events', 'focus', 'collegerecruitment']);
    const subTypeName = {
        notice: '学院通知',
        enrollment: '招生通知',
        'academic-paper': '学术观点',
        news: '新闻',
        events: '活动',
        focus: '视点',
        collegerecruitment: '教师与行政人员招聘',
    };

    const url = `https://sem.tongji.edu.cn/semch/category/frontpage/${subType.has(type) ? type : 'notice'}`;

    const results: Array<{ title: string; link: string; pubDate: Date }> = await getNotifByPage(url);

    const resultsWithContent = await Promise.all(results.map((item) => cache.tryGet(item.link, () => getArticle(item))));

    // feed the data to rss
    return {
        title: '同济大学经济与管理学院',
        description: String(subType.has(type) ? subTypeName[type] : '学院通知'),
        image: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        icon: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        logo: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        link: 'https://sem.tongji.edu.cn/semch',
        item: resultsWithContent,
    };
}
