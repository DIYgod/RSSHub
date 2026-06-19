import type { Route } from '@/types';

import { parseArticle, parseNewsList, rootUrl } from './utils';

export const route: Route = {
    path: '/:path{.+}?',
    name: '要闻',
    example: '/gov/ccdi/yaowenn',
    parameters: { path: '路径，默认为 要闻' },
    radar: [
        {
            source: ['www.ccdi.gov.cn/*path'],
            target: '/:path',
        },
    ],
    features: {
        antiCrawler: true,
    },
    maintainers: ['bigfei'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中 \`http://www.ccdi.gov.cn/\` 后的字段。下面是一个例子。

若订阅 [审查调查 > 中管干部 > 执纪审查](https://www.ccdi.gov.cn/scdcn/zggb/zjsc/) 则将对应页面 URL <https://www.ccdi.gov.cn/scdcn/zggb/zjsc/> 中 \`http://www.ccdi.gov.cn/\` 后的字段 \`scdcn/zggb/zjsc\` 作为路径填入。此时路由为 [\`/gov/ccdi/scdcn/zggb/zjsc\`](https://rsshub.app/gov/ccdi/scdcn/zggb/zjsc)

:::`,
};

async function handler(ctx) {
    const { path = 'yaowenn' } = ctx.req.param();
    const pathname = `/${path}${path.endsWith('/') ? '' : '/'}`;
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseNewsList(currentUrl, '.list_news_dl2 li', ctx);
    const items = await Promise.all(list.map((item) => parseArticle(item)));

    return {
        title,
        link: currentUrl,
        item: items,
    };
}
