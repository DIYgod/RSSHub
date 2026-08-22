import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/store/updates/:productid/:market?',
    categories: ['program-update'],
    example: '/microsoft/store/updates/9WZDNCRFHVN5/CN',
    parameters: { productid: '`Share` - `Copy Link` in the Store', market: '`CN` as default' },
    name: 'Store Updates',
    maintainers: ['hellodword'],
    handler,
};

async function handler(ctx: Context) {
    const { market = 'CN', productid } = ctx.req.param();
    const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const data = await ofetch(`https://displaycatalog.mp.microsoft.com/v7.0/products/${productid}/?fieldsTemplate=&market=${market}&languages=en`, {
        headers: {
            'Content-Type': 'application/json',
            'MS-CV': `${Array.from({ length: 16 }, () => CHARS.charAt(Math.floor(Math.random() * CHARS.length))).join('')}.1`,
        },
    });

    const link = `https://www.microsoft.com/store/productId/${productid}`;

    return {
        title: `${data.Product.LocalizedProperties[0].ProductTitle} - Microsoft Store Updates`,
        link,
        item: [
            {
                title: data.Product.DisplaySkuAvailabilities[0].Sku.Properties.Packages[0].PackageFullName,
                pubDate: parseDate(data.Product.DisplaySkuAvailabilities[0].Sku.LastModifiedDate),
                link,
            },
        ],
    };
}
