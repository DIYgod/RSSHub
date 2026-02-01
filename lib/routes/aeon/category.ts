import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getData } from './utils';

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

const ENDPOINT = 'https://api.aeonmedia.co/graphql';
const LIST_BY_SECTION = /* GraphQL */ `
query getAeonArticlesBySection($section: String!, $sortField: ArticleSortEnum = published_at, $afterCursor: String, $tag: String) {
  section(site: aeon, slug: $section) {
    slug
    title
    metaDescription
  }
  articles(
    site: aeon
    section: $section
    status: [published]
    tag: $tag
    sort: {field: $sortField, order: desc}
    after: $afterCursor
    first: 24
  ) {
    nodes {
      slug
      ...aeonArticleCardFragment
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

fragment aeonArticleCardFragment on Article {
  id
  title
  slug
  type
  standfirstLong
  authors { name }
  image { url }
  primaryTopic { title }
  section { slug }
}
`;

async function handler(ctx) {
    const category = ctx.req.param('category').toLowerCase();
    const url = `https://aeon.co/category/${category}`;
    const response = await ofetch(ENDPOINT, {
        method: 'POST',
        body: {
            operationName: 'getAeonArticlesBySection',
            query: LIST_BY_SECTION,
            variables: {
                section: category,
            },
        },
    });

    const list = response.data.articles.nodes.map((node) => ({
        title: node.title,
        description: node.standfirstLong,
        author: node.authors.map((author) => author.name).join(', '),
        link: `https://aeon.co/${node.type}s/${node.slug}`,
        category: node.primaryTopic.title,
        image: node.image.url,
        type: node.type,
        section: node.section.slug,
        slug: node.slug,
    }));

    const items = await getData(list);

    return {
        title: `AEON | ${response.data.section.title}`,
        link: url,
        description: response.data.section.metaDescription,
        item: items,
    };
}
