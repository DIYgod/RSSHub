import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, gqlEndpoint, parseItem } from './utils';

const handler = async (ctx) => {
    const uid = ctx.req.param('uid').replace(/^@/, '');
    const limit = getRouteLimit(ctx, 20);
    const response = await ofetch(gqlEndpoint, {
        method: 'POST',
        body: {
            query: /* GraphQL */ `{
                user(input: {userName: ${JSON.stringify(uid)}}) {
                  displayName
                  avatar
                  info {
                    description
                  }
                  articles(input: {first: ${limit}}) {
                    edges {
                      node {
                        shortHash
                        title
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
              }`,
        },
    });

    const user = response.data.user;

    return {
        title: `Matters | ${user.displayName}`,
        link: `${baseUrl}/@${uid}`,
        description: user.info.description,
        image: user.avatar,
        item: user.articles.edges.map(({ node }) => parseItem(node)),
    };
};

export const route: Route = {
    path: '/author/:uid',
    name: 'Author',
    example: '/matters/author/robertu',
    parameters: { uid: "Author id, can be found at author's homepage url" },
    maintainers: ['Cerebrater', 'xosdy'],
    handler,
    radar: [
        {
            source: ['matters.town/:uid'],
            target: '/author/:uid',
        },
    ],
};
