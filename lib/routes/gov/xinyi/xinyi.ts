import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/xinyi/www/zwgk/zcjd',
    parameters: { path: '路径，只填写 `www` 默认为 政务公开 > 政策解读' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.xinyi.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.xinyi.gov.cn/zwgk/zcjd/> 中 \`http://www.xinyi.gov.cn/\` 的字段 \`www\` 和 \`zwgk/zcjd/\` 作为路径填入。此时路由为 [\`/gov/xinyi/www/zwgk/zcjd/\`](https://rsshub.app/gov/xinyi/www/zwgk/zcjd/)

:::`,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.newsList li a',
        list_include: 'site',
        title_element: '.title',
        title_match: '(.*)',
        description_element: '.conTxt',
        author_element: undefined,
        author_match: undefined,
        authorisme: '信宜市人民政府网',
        pubDate_element: '.property span:nth-child(-n+2)',
        pubDate_match: '发布时间：(.*)',
        pubDate_format: undefined,
    };
    return await gdgov(info, ctx);
}
