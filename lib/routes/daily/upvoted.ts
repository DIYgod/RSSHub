import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, getData, getDateSort, getList, variables } from './utils.js';

const query = /* GraphQL */ `
    query MostUpvotedFeed($loggedIn: Boolean! = false, $first: Int, $after: String, $period: Int, $supportedTypes: [String!] = ["article", "share", "freeform", "video:youtube", "collection"], $source: ID, $tag: String) {
        page: mostUpvotedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
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
    path: '/upvoted/:period?/:dateSort?',
    example: '/daily/upvoted/7',
    view: ViewType.Articles,
    radar: [
        {
            source: ['daily.dev/posts/upvoted', 'daily.dev/upvoted'],
            target: '/upvoted',
        },
        {
            source: ['app.daily.dev/posts/upvoted', 'app.daily.dev/upvoted'],
            target: '/upvoted',
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
        period: {
            description: 'Period of Lookup',
            default: '7',
            options: [
                { value: '7', label: 'Last Week' },
                { value: '30', label: 'Last Month' },
                { value: '365', label: 'Last Year' },
            ],
        },
    },
    name: 'Most upvoted',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/upvoted',
};

async function handler(ctx): Promise<Data> {
    const link = `${baseUrl}/posts/upvoted`;
    const dateSort = getDateSort(ctx.req.param('dateSort'));
    const requestedLimit = getRouteLimit(ctx, 20);
    const shouldSort = ctx.req.query('sorted') === undefined ? dateSort : ctx.req.query('sorted') !== 'false';
    const limit = shouldSort ? Math.max(20, requestedLimit) : requestedLimit;
    const period = ctx.req.param('period') ? Number(ctx.req.param('period')) : 7;

    const data = await getData({
        query,
        variables: {
            ...variables,
            period,
            first: limit,
        },
    });
    const items = getList(data);

    return {
        title: 'Most upvoted posts for developers | daily.dev',
        link,
        item: items,
        sortItems: dateSort,
        description: 'Find the most upvoted developer posts on daily.dev. Explore top-rated content in coding, tutorials, and tech news from the largest developer network in the world.',
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
