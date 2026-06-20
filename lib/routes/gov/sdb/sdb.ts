import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/sdb/www/zwgk/zcjd',
    parameters: { path: '路径，只填写 `www` 默认为 政务公开 > 政策解读' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.sdb.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.sdb.gov.cn/zwgk/zcjd/> 中 \`http://www.sdb.gov.cn/\` 的字段 \`www\` 和 \`zwgk/zcjd/\` 作为路径填入。此时路由为 [\`/gov/sdb/www/zwgk/zcjd/\`](https://rsshub.app/gov/sdb/www/zwgk/zcjd/)

:::`,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.art-list li a',
        list_include: 'site',
        title_element: '.title',
        title_match: '(.*)',
        description_element: '.text',
        author_element: '.source',
        author_match: '来源：(.*)发布时间',
        authorisme: '广东省茂名水东湾新城建设管理委员会网站',
        pubDate_element: '.source',
        pubDate_match: '发布时间：(.*)',
        pubDate_format: undefined,
    };
    return await gdgov(info, ctx);
}
