import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, gqlEndpoint, parseItem } from './utils';

interface Tag {
    __ref: string;
}

const getTagId = (tid: string) =>
    cache.tryGet(`matters:tags:${tid}`, async () => {
        const response = await ofetch(`${baseUrl}/tags/${tid}`);
        const $ = load(response);
        const nextData = JSON.parse($('script#__NEXT_DATA__').text());

        const node = Object.entries<Tag>(nextData.props.apolloState.ROOT_QUERY).find(([key]) => key.startsWith('node('))?.[1];
        if (!node) {
            throw new Error(`Failed to find the tag id of ${tid}`);
        }

        const tag = nextData.props.apolloState[node.__ref];
        if (!tag?.id) {
            throw new Error(`Failed to resolve the tag reference of ${tid}`);
        }
        return tag.id;
    });

const handler = async (ctx) => {
    const { tid } = ctx.req.param();
    const limit = getRouteLimit(ctx, 20);

    const tagId = await getTagId(tid);

    const gqlResponse = await ofetch(gqlEndpoint, {
        method: 'POST',
        body: {
            query: /* GraphQL */ `{
                node(input: {id: "${tagId}"}) {
                  ... on Tag {
                    content
                    articles(input: {first: ${limit}}) {
                      edges {
                        node {
                          title
                          shortHash
                          content
                          createdAt
                          author {
                            displayName
                          }
                          tags {
                            content
                          }
                        }
                      }
                    }
                  }
                }
              }`,
        },
    });

    const node = gqlResponse.data.node;

    return {
        title: `Matters | ${node.content}`,
        link: `${baseUrl}/tags/${tid}`,
        item: node.articles.edges.map(({ node }) => parseItem(node)),
    };
};

export const route: Route = {
    path: '/tags/:tid',
    name: 'Tags',
    example: '/matters/tags/972-哲學',
    parameters: { tid: 'Tag id, can be found in the url of the tag page' },
    maintainers: ['Cerebrater'],
    handler,
    radar: [
        {
            source: ['matters.town/tags/:tid'],
        },
    ],
};
