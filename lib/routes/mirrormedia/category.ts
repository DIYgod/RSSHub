import { Route } from '@/types';

import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { getArticle } from './utils';

export const route: Route = {
    path: ['/category/:category', '/section/:section'],
    categories: ['traditional-media'],
    example: '/mirrormedia/category/political',
    parameters: { category: '分类名', section: '子板名' },
    name: '分类',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['mirrormedia.mg/category/:category', 'mirrormedia.mg/section/:section'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category, section } = ctx.req.param();
    const categoryFilter = category ? { categories: { some: { slug: { equals: category } } } } : {};
    const sectionFilter = section ? { sections: { some: { slug: { equals: section } } } } : {};
    const rootUrl = 'https://www.mirrormedia.mg';

    const response = await ofetch('https://adam-weekly-api-server-prod-ufaummkd5q-de.a.run.app/content/graphql', {
        method: 'POST',
        body: {
            variables: {
                take: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 24,
                skip: 0,
                orderBy: { publishedDate: 'desc' },
                filter: {
                    state: { equals: 'published' },
                    ...categoryFilter, ...sectionFilter,
                },
            },
            query: `fragment section on Section {\n  id\n  name\n  slug\n  state\n  __typename\n}\n\nfragment category on Category {\n  id\n  name\n  slug\n  state\n  __typename\n}\n\nfragment listingPost on Post {\n  id\n  slug\n  title\n  brief\n  publishedDate\n  state\n  sections(where: {state: {equals: "active"}}) {\n    ...section\n    __typename\n  }\n  categories(where: {state: {equals: "active"}}) {\n    ...category\n    __typename\n  }\n  isFeatured\n  __typename\n}\n\nquery ($take: Int, $skip: Int, $orderBy: [PostOrderByInput!]!, $filter: PostWhereInput!) {\n  postsCount(where: $filter)\n  posts(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n    ...listingPost\n    __typename\n  }\n}`,
        },
    });

    const items = response.data.posts.map((e) => ({
        title: e.title,
        pubDate: parseDate(e.publishedDate),
        category: [...(e.sections ?? []).map((_) => `section:${_.name}`), ...(e.categories ?? []).map((_) => `category:${_.name}`)],
        link: `${rootUrl}/${'story'}/${e.slug}`,
    }));

    const list = await Promise.all(items.map((item) => getArticle(item)));

    return {
        title: `鏡週刊 Mirror Media - ${category}`,
        link: rootUrl,
        item: list,
    };
}
