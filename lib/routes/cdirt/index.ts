import { Route } from '@/types';
import { handler } from './handler-func';

export const route: Route = {
    path: '/:category',
    categories: ['university'],
    example: '/cdirt/notice',
    parameters: {
        category: '分类名，包含主分类和次分类，主分类由维护者拟定，次分类为目标网站的自然分类',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `
| 栏目名 | 主分类   | 次分类       |
|------|--------|--------------|
| 通知公告 | notice | notification |
| 人才招聘 | notice | job          |
| 校历   | notice | calender     |
| 党建群团 | news   | party        |
| 人才培养 | news   | talent       |
| 青春校园 | news   | campus       |
- category 也可填 all 即可囊括上述全部分类。 
`,
    radar: [
        {
            source: ['https://edua.chengdurail.com', 'https://edua.chengdurail.com/static/html'],
        },
    ],
    name: '成都轨道交通职业学院',
    maintainers: ['ArtificialPigment'],
    handler,
    url: 'edua.chengdurail.com',
};