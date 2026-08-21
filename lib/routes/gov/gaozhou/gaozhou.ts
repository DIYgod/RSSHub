import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/gaozhou/www/zcjd',
    parameters: { path: '路径，只填写 `www` 默认为 政策解读' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政策解读](http://www.gaozhou.gov.cn/zcjd/) 则将对应页面 URL <http://www.gaozhou.gov.cn/zcjd/> 中 \`http://www.gaozhou.gov.cn/\` 的字段 \`www\` 和 \`zcjd/\` 作为路径填入。此时路由为 [\`/gov/gaozhou/www/zcjd/\`](https://rsshub.app/gov/gaozhou/www/zcjd/)

:::`,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'zcjd/',
        list_element: '.newslist li a',
        list_include: 'site',
        title_element: '.head',
        title_match: '(.*)',
        description_element: '.contener',
        author_element: undefined,
        author_match: undefined,
        authorisme: '高州市人民政府网',
        pubDate_element: '.time span:nth-child(1)',
        pubDate_match: '发布时间：(.*)',
        pubDate_format: undefined,
    };
    return await gdgov(info, ctx);
}
