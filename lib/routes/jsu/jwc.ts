import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getCmsItems } from './utils';

export const route: Route = {
    path: '/jwc/:types?',
    categories: ['university'],
    example: '/jsu/jwc/jwdt',
    parameters: { types: '通知分类 默认为`jwtz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['wenjia03'],
    handler,
    description: `| 教务通知 | 教务动态 |
| -------- | -------- |
| jwtz     | jwdt     |`,
};

async function handler(ctx) {
    const { types = 'jwtz' } = ctx.req.param();
    const sections = {
        jwtz: { category: '教务通知', url: 'https://jwc.jsu.edu.cn/tzgg/index.htm' },
        jwdt: { category: '教务动态', url: 'https://jwc.jsu.edu.cn/jwdt/index.htm' },
    };
    if (!Object.hasOwn(sections, types)) {
        throw new InvalidParameterError('Unsupported Jishou University academic affairs category. Use jwtz or jwdt.');
    }
    const section = sections[types];
    return {
        title: `吉首大学教务处 - ${section.category}`,
        link: section.url,
        description: `吉首大学教务处 - ${section.category}`,
        item: await getCmsItems(section.url, section.category),
    };
}
