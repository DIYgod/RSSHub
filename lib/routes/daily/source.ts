import { config } from '@/config';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, getBuildId, getData, getList } from './utils';

interface Source {
    id: string;
    name: string;
    handle: string;
    image: string;
    permalink: string;
    description: string;
    type: string;
}

const sourceFeedQuery = /* GraphQL */ `
    query SourceFeed($source: ID!, $loggedIn: Boolean! = false, $first: Int, $after: String, $ranking: Ranking, $supportedTypes: [String!]) {
        page: sourceFeed(source: $source, first: $first, after: $after, ranking: $ranking, supportedTypes: $supportedTypes) {
            ...FeedPostConnection
        }
    }

    fragment FeedPostConnection on PostConnection {
        pageInfo {
            hasNextPage
            endCursor
        }
        edges {
            node {
                ...FeedPost
                pinnedAt
                contentHtml
                ...UserPost @include(if: $loggedIn)
            }
        }
    }

    fragment FeedPost on Post {
        ...FeedPostInfo
        sharedPost {
            id
            title
            summary
            image
            readTime
            permalink
            commentsPermalink
            createdAt
            type
            tags
            source {
                id
                handle
                permalink
                image
            }
            slug
        }
        trending
        feedMeta
        collectionSources {
            handle
            image
        }
        numCollectionSources
        updatedAt
        slug
    }

    fragment FeedPostInfo on Post {
        id
        title
        image
        readTime
        permalink
        commentsPermalink
        createdAt
        commented
        bookmarked
        views
        numUpvotes
        numComments
        summary
        bookmark {
            remindAt
        }
        author {
            id
            name
            image
            username
            permalink
        }
        type
        tags
        source {
            id
            handle
            name
            permalink
            image
            type
        }
        userState {
            vote
            flags {
                feedbackDismiss
            }
        }
        slug
    }

    fragment UserPost on Post {
        read
        upvoted
        commented
        bookmarked
        downvoted
    }
`;

export const route: Route = {
    path: '/source/:sourceId',
    example: '/daily/source/hn',
    parameters: {
        sourceId: 'The source id',
    },
    radar: [
        {
            source: ['daily.dev/sources/:sourceId'],
            target: '/source/:sourceId',
        },
        {
            source: ['app.daily.dev/sources/:sourceId'],
            target: '/source/:sourceId',
        },
    ],
    name: 'Source Posts',
    maintainers: ['TonyRL'],
    handler,
    url: 'app.daily.dev',
};

async function handler(ctx): Promise<Data> {
    const sourceId = ctx.req.param('sourceId');
    const requestedLimit = getRouteLimit(ctx, 10);
    const limit = ctx.req.query('sorted') === 'false' ? requestedLimit : Math.max(10, requestedLimit);

    const link = `${baseUrl}/sources/${sourceId}`;
    const buildId = await getBuildId();

    const userData = await cache.tryGet(`daily:source:${sourceId}`, async () => {
        const response = await ofetch<{ pageProps: { source: Source } }>(`${baseUrl}/_next/data/${buildId}/sources/${sourceId}.json`);
        return response.pageProps.source;
    });

    const items = await cache.tryGet(
        `daily:source:${sourceId}:posts:${limit}`,
        async () => {
            const edges = await getData({
                query: sourceFeedQuery,
                variables: {
                    source: sourceId,
                    supportedTypes: ['article', 'video:youtube', 'collection'],
                    period: 30,
                    first: limit,
                    after: '',
                    loggedIn: false,
                },
            });
            return getList(edges);
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${userData.name} posts on daily.dev`,
        description: userData.description,
        link,
        item: items,
        image: userData.image,
        logo: userData.image,
        icon: userData.image,
        language: 'en-us',
    };
}
