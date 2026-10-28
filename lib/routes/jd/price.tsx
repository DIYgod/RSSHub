import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

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
    if (!/^\d+$/.test(id)) {
        throw new InvalidParameterError('The product ID must be the number in its item.jd.com/<id>.html URL.');
    }

    const rootUrl = 'https://item.jd.com';
    const currentUrl = `${rootUrl}/${id}.html`;
    const apiUrl = `http://p.3.cn/prices/mgets?skuIds=J_${id}`;

    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = apiResponse.data?.[0];
    if (data?.p === undefined || data.p === null || data.p === '') {
        throw new Error('The price source did not return product pricing. Check that the product exists and is available on JD.');
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const title = response.data.match(/name: '(.*?)'/)?.[1];
    if (!title) {
        throw new Error('The product page did not provide its name. The source may be unavailable or its layout may have changed.');
    }

    return {
        title: `京东商品价格 - ${title}`,
        link: currentUrl,
        item: [
            {
                guid: data.p,
                title: data.p,
                link: currentUrl,
                description: renderToString(
                    <>
                        <p>
                            目前价格：<b>{data.p}</b>
                        </p>
                        <p>
                            指导价：<b>{data.op}</b>
                        </p>
                        <p>
                            最高价：<b>{data.m}</b>
                        </p>
                    </>
                ),
            },
        ],
    };
}
