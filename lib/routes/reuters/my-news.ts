import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import RejectError from '@/errors/types/reject';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

type Article = {
    id: string;
    canonicalUrl: string;
    title: string;
    description?: string;
    displayTime?: string;
    category?: string;
    sectionCategory?: string;
};

type FeedResponse = {
    data?: {
        feed?: {
            edges: Array<{ node?: Article }>;
        };
    };
    errors?: Array<{ message: string }>;
};

const feedQuery = /* GraphQL */ `
    query getFeed($size: Int!, $endCursor: String = "") {
        feed: myFeed(input: { first: $size, after: $endCursor, feedPreference: [TAG, SECTION, LAW_FIRM, COMPANY, AUTHOR] }) {
            edges {
                node {
                    id
                    canonicalUrl
                    title
                    description
                    displayTime
                    category
                    sectionCategory
                }
            }
        }
    }
`;

export const route: Route = {
    path: '/my-news',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/reuters/my-news',
    features: {
        requireConfig: [
            {
                name: 'REUTERS_AUTH_TOKEN',
                optional: false,
                description: 'Sign in to Reuters and open Browser Devtools to find `rt_token` from Local Storage.',
            },
        ],
        requirePuppeteer: false,
    },
    name: 'My News',
    maintainers: ['dzx-dzx'],
    handler,
    description: "The first page of the configured Reuters account's personalized My News feed. Requires a self-hosted instance with `REUTERS_AUTH_TOKEN` configured.",
};

async function handler(ctx): Promise<Data> {
    const authToken = config.reuters.authToken;
    if (!authToken) {
        throw new ConfigNotFoundError('Set REUTERS_AUTH_TOKEN to the bearer token.');
    }

    const response = await ofetch<FeedResponse>('https://www.reuters.com/service/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Accept-Language': 'en-US,en;q=0.9',
        },
        body: {
            operationName: 'getFeed',
            variables: { endCursor: '', size: getRouteLimit(ctx, 15) },
            query: feedQuery,
        },
    });

    if (response.errors?.length) {
        throw new RejectError(`Reuters My News request failed: ${response.errors.map((error) => error.message).join('; ')}. If the token has expired, update REUTERS_AUTH_TOKEN.`);
    }

    const feed = response.data?.feed;
    if (!feed) {
        throw new RejectError('Reuters did not return a My News feed. Check REUTERS_AUTH_TOKEN and confirm that My News loads in your signed-in browser.');
    }

    const items = feed.edges.flatMap(({ node }): DataItem[] =>
        node?.canonicalUrl
            ? [
                  {
                      title: node.title,
                      link: new URL(node.canonicalUrl, 'https://www.reuters.com').href,
                      guid: node.id,
                      description: node.description,
                      pubDate: node.displayTime ? parseDate(node.displayTime) : undefined,
                      category: [...new Set([node.category, node.sectionCategory].filter((category): category is string => Boolean(category)))],
                  },
              ]
            : []
    );

    return {
        title: 'My News | Reuters',
        description: 'Personalized Reuters news feed',
        link: 'https://www.reuters.com/my-news/feed',
        item: items,
    };
}
