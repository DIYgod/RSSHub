import type { Route } from '@/types';

import { gdgov } from '../general/general';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/dianbai/www/zwgk/zcjd',
    parameters: { path: '路径，只填写 `www` 默认为 政务公开 > 政策解读' },
    maintainers: ['ShuiHuo'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.dianbai.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.dianbai.gov.cn/zwgk/zcjd/> 中 \`http://www.dianbai.gov.cn/\` 的字段 \`www\` 和 \`zwgk/zcjd/\` 作为路径填入。此时路由为 [\`/gov/dianbai/www/zwgk/zcjd/\`](https://rsshub.app/gov/dianbai/www/zwgk/zcjd/)

:::`,
};

async function handler(ctx) {
    const info = {
        defaultPath: 'zwgk/zcjd/',
        list_element: '.news_list li a',
        title_element: '.content_title',
        title_match: '(.*)',
        description_element: '#zoomcon',
        author_element: undefined,
        author_match: undefined,
        authorisme: '茂名市电白区人民政府网',
        pubDate_element: 'publishtime',
        pubDate_match: '(.*)',
        pubDate_format: undefined,
    };
    return await gdgov(info, ctx);
}
