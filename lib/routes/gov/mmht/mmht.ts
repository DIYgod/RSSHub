import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/mmht/www/xwzx/zcjd',
    parameters: { path: '路径，只填写 `www` 默认为 政务公开 > 政策解读' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.mmht.gov.cn/xwzx/zcjd/) 则将对应页面 URL <http://www.mmht.gov.cn/xwzx/zcjd/> 中 \`http://www.mmht.gov.cn/\` 的字段 \`www\` 和 \`xwzx/zcjd/\` 作为路径填入。此时路由为 [\`/gov/mmht/www/xwzx/zcjd/\`](https://rsshub.app/gov/mmht/www/xwzx/zcjd/)

:::`,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'xwzx/zcjd/',
        list_element: '#main21l_main_dk > table > tbody > tr > td:nth-child(2) a',
        list_include: 'site',
        title_element: 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(2)',
        title_match: '(.*)',
        description_element: 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(4)',
        author_element: undefined,
        author_match: undefined,
        authorisme: '茂名市高新技术产业开发局政务网',
        pubDate_element: 'td[background="/global/rlyelen_line04.gif"] > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr > td',
        pubDate_match: '发表时间：(.*)       信息来源',
        pubDate_format: undefined,
    };
    return await gdgov(info, ctx);
}
