import { Route } from '@/types';
import getMzzlbg from './utils/mzzlbg';
import xinwen1j1 from './utils/xinwen1j1';
import getNews from './utils/news';

export const route: Route = {
    path: '/:category',
    categories: ['bbs'],
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
    radar: {
        source: ['news.cctv.com/:category'],
    },
    name: '专题',
    maintainers: ['idealclover', 'xyqfer'],
    handler,
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

    ctx.set('data', responseData);
}
