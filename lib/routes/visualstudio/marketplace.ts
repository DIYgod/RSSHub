import type { Context } from 'hono';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const categories: Record<string, { section: string }> = {
    featured: { section: 'Featured' },
    trending: { section: 'Trending Weekly' },
    trending_w: { section: 'Trending Weekly' },
    trending_d: { section: 'Trending Daily' },
    trending_m: { section: 'Trending Monthly' },
    popular: { section: 'Most Popular' },
    new: { section: 'Recently Added' },
};

export const route: Route = {
    path: '/marketplace/:type?',
    categories: ['programming'],
    example: '/visualstudio/marketplace',
    parameters: { type: 'Category' },
    name: 'Code Extensions Marketplace',
    maintainers: ['SeanChao'],
    handler,
    description: `| Featured | Trending Weekly | Trending Monthly | Trending Daily | Most Popular | Recently Added |
| -------- | --------------- | ---------------- | -------------- | ------------ | -------------- |
| featured | trending        | trending\\_m      | trending\\_d    | popular      | new            |`,
};

async function handler(ctx: Context) {
    const { type = 'featured' } = ctx.req.param();

    const category = Object.hasOwn(categories, type) ? categories[type] : undefined;
    if (!category) {
        throw new NotFoundError('Unknown Marketplace category. Use a category listed in the route documentation.');
    }

    const rootLink = 'https://marketplace.visualstudio.com/';
    const jsonData = await ofetch<{ epc: Array<{ cn: string; e: Array<{ t: string; s: string; l: string; a: string; i?: string }> }> }>(
        'https://marketplace.visualstudio.com/getextensionspercategory?Product=vscode&RemoveFirstSetCategories=true'
    );
    const section = jsonData.epc.find((entry) => entry.cn === category.section);
    if (!section) {
        throw new NotFoundError(`The Marketplace API does not currently provide the ${category.section} category`);
    }
    const extensionsList = section.e;

    return {
        title: 'VS Code Extensions: ' + category.section,
        link: rootLink,
        item: extensionsList.map((item) => ({
            title: item.t,
            description: item.s,
            link: new URL(item.l, rootLink).href,
            author: item.a,
            image: item.i || undefined,
        })),
    };
}
