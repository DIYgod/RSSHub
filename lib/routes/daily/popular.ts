import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, getData, getDateSort, getList, variables } from './utils.js';

const query = /* GraphQL */ `
    query AnonymousFeed($loggedIn: Boolean! = false, $first: Int, $after: String, $ranking: Ranking, $version: Int, $supportedTypes: [String!] = ["article", "share", "freeform", "video:youtube", "collection"]) {
        page: anonymousFeed(first: $first, after: $after, ranking: $ranking, version: $version, supportedTypes: $supportedTypes) {
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
            clickbaitTitleDetected
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
        clickbaitTitleDetected
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
    path: '/popular/:dateSort?',
    example: '/daily/popular',
    view: ViewType.Articles,
    radar: [
        {
            source: ['daily.dev/posts', 'daily.dev/popular'],
            target: '/popular',
        },
        {
            source: ['app.daily.dev/posts', 'app.daily.dev/popular'],
            target: '/popular',
        },
    ],
    parameters: {
        dateSort: {
            description: 'Sort posts by publication date instead of popularity',
            default: 'true',
            options: [
                { value: 'false', label: 'False' },
                { value: 'true', label: 'True' },
            ],
        },
    },
    name: 'Popular',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/popular',
};

async function handler(ctx): Promise<Data> {
    const link = `${baseUrl}/posts`;
    const dateSort = getDateSort(ctx.req.param('dateSort'));
    const requestedLimit = getRouteLimit(ctx, 15);
    const shouldSort = ctx.req.query('sorted') === undefined ? dateSort : ctx.req.query('sorted') !== 'false';
    const limit = shouldSort ? Math.max(15, requestedLimit) : requestedLimit;

    const data = await getData({
        query,
        variables: {
            ...variables,
            ranking: 'POPULARITY',
            first: limit,
        },
    });
    const items = getList(data);

    return {
        title: 'Popular posts on daily.dev',
        link,
        item: items,
        sortItems: dateSort,
        description: 'daily.dev is the easiest way to stay updated on the latest programming news. Get the best content from the top tech publications on any topic you want.',
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
