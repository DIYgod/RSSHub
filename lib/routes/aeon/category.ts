import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getBuildId, getData } from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media'],
    example: '/aeon/category/philosophy',
    parameters: {
        category: {
            description: 'Category',
            options: [
                { value: 'philosophy', label: 'Philosophy' },
                { value: 'science', label: 'Science' },
                { value: 'psychology', label: 'Psychology' },
                { value: 'society', label: 'Society' },
                { value: 'culture', label: 'Culture' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['aeon.co/:category'],
        },
    ],
    name: 'Categories',
    maintainers: ['emdoe'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category').toLowerCase();
    const url = `https://aeon.co/category/${category}`;
    const buildId = await getBuildId();
    const response = await ofetch(`https://aeon.co/_next/data/${buildId}/${category}.json`);

    const section = response.pageProps.section;

    const list = section.articles.edges.map(({ node }) => ({
        title: node.title,
        description: node.standfirstLong,
        author: node.authors.map((author) => author.displayName).join(', '),
        link: `https://aeon.co/${node.type}s/${node.slug}`,
        pubDate: parseDate(node.createdAt),
        category: [node.section.title, ...node.topics.map((topic) => topic.title)],
        image: node.image.url,
        type: node.type,
        slug: node.slug,
    }));

    const items = await getData(list);

    return {
        title: `AEON | ${section.title}`,
        link: url,
        description: section.metaDescription,
        item: items,
    };
}
