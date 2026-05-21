import { createXinhuaChineseRoute } from './utils';

export const route = createXinhuaChineseRoute({
    path: '/politics',
    name: '\u65f6\u653f',
    example: '/xinhua/politics',
    source: 'https://www.news.cn/politics/index.html',
    title: '\u65b0\u534e\u7f51 - \u65f6\u653f',
    description: '\u65b0\u534e\u7f51\u65f6\u653f\u9891\u9053\u3002',
    section: 'politics',
});
