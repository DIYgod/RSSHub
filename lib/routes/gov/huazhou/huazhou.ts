import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/huazhou/www/syzl/zcjd',
    parameters: { path: '路径，只填写 `www` 默认为 政策解读' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政策解读](http://www.huazhou.gov.cn/syzl/zcjd/) 则将对应页面 URL <http://www.huazhou.gov.cn/syzl/zcjd/> 中 \`http://www.huazhou.gov.cn/\` 的字段 \`www\` \`syzl/zcjd/\` 作为路径填入。此时路由为 [\`/gov/huazhou/www/syzl/zcjd/\`](https://rsshub.app/gov/huazhou/www/syzl/zcjd/)

:::`,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'syzl/zcjd/',
        list_element: '.list-content li a',
        list_include: 'site',
        title_element: 'h3',
        title_match: '(.*)',
        description_element: '.txt',
        author_element: undefined,
        author_match: undefined,
        authorisme: '化州市人民政府网',
        pubDate_element: '.article-date',
        pubDate_match: '日期：(.*)',
        pubDate_format: undefined,
    };
    return await gdgov(info, ctx);
}
