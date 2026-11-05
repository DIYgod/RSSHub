import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, getData, getDateSort, getList, variables } from './utils.js';

const query = /* GraphQL */ `
    query MostDiscussedFeed($first: Int, $period: Int, $supportedTypes: [String!] = ["article", "share", "freeform"]) {
        page: mostDiscussedFeed(first: $first, period: $period, supportedTypes: $supportedTypes) {
            ...FeedPostConnection
        }
    }

    fragment FeedPostConnection on PostConnection {
        edges {
            node {
                ...FeedPost
                contentHtml
            }
        }
    }

    fragment FeedPost on Post {
        ...SharedPostInfo
        type
        sharedPost {
            title
            summary
            image
            permalink
        }
    }

    fragment SharedPostInfo on Post {
        id
        title
        image
        readTime
        permalink
        commentsPermalink
        summary
        createdAt
        numUpvotes
        numComments
        author {
            ...UserShortInfo
        }
        tags
    }

    fragment UserShortInfo on User {
        id
        name
        image
        permalink
        username
        bio
    }
`;

export const route: Route = {
    path: '/discussed/:period?/:dateSort?',
    example: '/daily/discussed/30',
    view: ViewType.Articles,
    radar: [
        {
            source: ['daily.dev/posts/discussed', 'daily.dev/discussed'],
            target: '/discussed',
        },
        {
            source: ['app.daily.dev/posts/discussed', 'app.daily.dev/discussed'],
            target: '/discussed',
        },
    ],
    name: 'Most Discussed',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/discussed',
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
};

async function handler(ctx): Promise<Data> {
    const dateSort = getDateSort(ctx.req.param('dateSort'));
    const requestedLimit = getRouteLimit(ctx, 20);
    const shouldSort = ctx.req.query('sorted') === undefined ? dateSort : ctx.req.query('sorted') !== 'false';
    const limit = shouldSort ? Math.max(20, requestedLimit) : requestedLimit;
    const period = ctx.req.param('period') ? Number(ctx.req.param('period')) : 7;

    const link = `${baseUrl}/posts/discussed`;

    const data = await getData({
        query,
        variables: {
            ...variables,
            first: limit,
            period,
        },
    });
    const items = getList(data);

    return {
        title: 'Real-time discussions in the developer community | daily.dev',
        link,
        item: items,
        sortItems: dateSort,
        description: 'Stay on top of real-time developer discussions on daily.dev. Join conversations happening now and engage with the most active community members.',
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
