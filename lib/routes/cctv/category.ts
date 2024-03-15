import { Route } from '@/types';
import getMzzlbg from './utils/mzzlbg';
import xinwen1j1 from './utils/xinwen1j1';
import getNews from './utils/news';

export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    example: '/cctv/world',
    parameters: { category: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.cctv.com/:category'],
        },
    ],
    name: '专题',
    maintainers: ['idealclover', 'xyqfer'],
    handler,
    description: `| 新闻 | 国内  | 国际  | 社会    | 法治 | 文娱 | 科技 | 生活 | 教育 | 每周质量报告 | 新闻 1+1  |
  | ---- | ----- | ----- | ------- | ---- | ---- | ---- | ---- | ---- | ------------ | --------- |
  | news | china | world | society | law  | ent  | tech | life | edu  | mzzlbg       | xinwen1j1 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    let responseData;

    if (category === 'mzzlbg') {
        // 每周质量报告
        responseData = await getMzzlbg();
    } else if (category === 'xinwen1j1') {
        // 新闻1+1
        responseData = await xinwen1j1();
    } else {
        // 央视新闻
        responseData = await getNews(category);
    }

    return responseData;
}
