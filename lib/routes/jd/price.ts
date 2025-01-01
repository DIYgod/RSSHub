import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/price/:id',
    categories: ['shopping'],
    example: '/jd/price/526835',
    parameters: { id: '商品 id，可在商品详情页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '商品价格',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  如商品 \`https://item.jd.com/526835.html\` 中的 id 为 \`526835\`，所以路由为 [\`/jd/price/526835\`](https://rsshub.app/jd/price/526835)
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://item.jd.com';
    const currentUrl = `${rootUrl}/${id}.html`;
    const apiUrl = `http://p.3.cn/prices/mgets?skuIds=J_${id}`;

    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = apiResponse.data[0];

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const title = response.data.match(/name: '(.*?)'/)[1];

    return {
        title: `京东商品价格 - ${title}`,
        link: currentUrl,
        item: [
            {
                guid: data.p,
                title: data.p,
                link: currentUrl,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    p: data.p,
                    op: data.op,
                    m: data.m,
                }),
            },
        ],
    };
}
