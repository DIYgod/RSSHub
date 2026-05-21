import { createXinhuaChineseRoute } from './utils';

export const route = createXinhuaChineseRoute({
    path: '/fortune',
    name: '\u8d22\u7ecf',
    example: '/xinhua/fortune',
    source: 'https://www.news.cn/fortune/index.htm',
    title: '\u65b0\u534e\u7f51 - \u8d22\u7ecf',
    description: '\u65b0\u534e\u7f51\u8d22\u7ecf\u9891\u9053\u3002',
    section: 'fortune',
});
