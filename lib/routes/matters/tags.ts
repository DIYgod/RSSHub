import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import cache from '@/utils/cache';
import { baseUrl, gqlEndpoint, parseItem } from './utils';

interface Tag {
    type: string;
    generated: boolean;
    id: string;
    typename: string;
}

const getTagId = (tid: string) =>
    cache.tryGet(`matters:tags:${tid}`, async () => {
        const response = await ofetch(`${baseUrl}/tags/${tid}`);
        const $ = cheerio.load(response);
        const nextData = JSON.parse($('script#__NEXT_DATA__').text());

        const node = Object.entries(nextData.props.apolloState.data.ROOT_QUERY)
            .find(([key]) => key.startsWith('node'))
            ?.pop() as Tag;

        return node?.id.split(':')[1];
    });

const handler = async (ctx) => {
    const { tid } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const tagId = await getTagId(tid);

    const gqlResponse = await ofetch(gqlEndpoint, {
        method: 'POST',
        body: {
            query: `{
                node(input: {id: "${tagId}"}) {
                  ... on Tag {
                    content
                    description
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
        description: node.description,
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
