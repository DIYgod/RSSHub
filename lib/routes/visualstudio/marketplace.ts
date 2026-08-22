import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/marketplace/:type?',
    categories: ['programming'],
    example: '/visualstudio/marketplace',
    parameters: { type: 'Category' },
    name: 'Visual Studio Code Plugins Marketplace',
    maintainers: ['SeanChao'],
    handler,
    description: `| Featured | Trending Weekly | Trending Monthly | Trending Daily | Most Popular | Recently Added |
| -------- | --------------- | ---------------- | -------------- | ------------ | -------------- |
| featured | trending        | trending\\_m      | trending\\_d    | popular      | new            |`,
};

async function handler(ctx: Context) {
    const { type = 'featured' } = ctx.req.param();

    const category = {
        featured: { id: 0, section: 'Featured' },
        trending: { id: 1, section: 'Trending Weekly' },
        trending_w: { id: 1, section: 'Trending Weekly' },
        trending_d: { id: 2, section: 'Trending Daily' },
        trending_m: { id: 3, section: 'Trending Monthly' },
        popular: { id: 4, section: 'Most Popular' },
        new: { id: 5, section: 'Recently Added' },
    };

    const rootLink = 'https://marketplace.visualstudio.com/';
    const jsonData = await ofetch('https://marketplace.visualstudio.com/getextensionspercategory?Product=vscode&RemoveFirstSetCategories=true');
    const extensionsList = jsonData.epc[category[type].id].e;

    return {
        title: 'VS Code Extensions: ' + category[type].section,
        link: rootLink,
        item: extensionsList.map((item) => ({
            title: item.t,
            description: item.s,
            link: new URL(item.l, rootLink).href,
            author: item.a,
        })),
    };
}
