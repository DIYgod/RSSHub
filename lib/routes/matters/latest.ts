import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, gqlEndpoint, parseItem } from './utils';

const handler = async (ctx) => {
    const { type = 'latest' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 20);
    const options = {
        latest: {
            title: '最新',
            apiType: 'newest',
        },
        heat: {
            title: '熱議',
            apiType: 'hottest',
        },
        essence: {
            title: '精華',
            apiType: 'icymi',
        },
    };

    if (!Object.hasOwn(options, type)) {
        throw new InvalidParameterError('The feed type must be latest, heat or essence.');
    }

    const response = await ofetch(gqlEndpoint, {
        method: 'POST',
        body: {
            query: /* GraphQL */ `{
                viewer {
                  recommendation {
                    feed: ${options[type].apiType}(input: {first: ${limit}}) {
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
                }
              }`,
        },
    });

    const item = response.data.viewer.recommendation.feed.edges.map(({ node }) => parseItem(node));

    return {
        title: `Matters | ${options[type].title}`,
        link: baseUrl,
        item,
    };
};
export const route: Route = {
    path: '/latest/:type?',
    name: 'Latest, heat, essence',
    example: '/matters/latest/heat',
    parameters: { type: 'Defaults to latest, see table below' },
    maintainers: ['xyqfer', 'Cerebrater', 'xosdy'],
    handler,
    radar: [
        {
            source: ['matters.town'],
        },
    ],
    description: `| 最新   | 热门 | 精华    |
| ------ | ---- | ------- |
| latest | heat | essence |`,
};
