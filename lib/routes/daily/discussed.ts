import type { Route } from '@/types';
import { ViewType } from '@/types';

import { baseUrl, getData, getList, variables } from './utils.js';

const query = `
  query MostDiscussedFeed(
    $first: Int
    $supportedTypes: [String!] = ["article","share","freeform"]
    ) {
    page: mostDiscussedFeed(first: $first, supportedTypes: $supportedTypes) {
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
    path: '/discussed/:period?/:innerSharedContent?/:dateSort?',
    example: '/daily/discussed/30',
    view: ViewType.Articles,
    radar: [
        {
            source: ['app.daily.dev/discussed'],
        },
    ],
    name: 'Most Discussed',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/discussed',
    parameters: {
        innerSharedContent: {
            description: 'Where to Fetch inner Shared Posts instead of original',
            default: 'false',
            options: [
                { value: 'false', label: 'False' },
                { value: 'true', label: 'True' },
            ],
        },
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

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const innerSharedContent = ctx.req.param('innerSharedContent') ? JSON.parse(ctx.req.param('innerSharedContent')) : false;
    const dateSort = ctx.req.param('dateSort') ? JSON.parse(ctx.req.param('dateSort')) : true;
    const period = ctx.req.param('period') ? Number.parseInt(ctx.req.param('period'), 10) : 7;

    const link = `${baseUrl}/posts/discussed`;

    const data = await getData({
        query,
        variables: {
            ...variables,
            first: limit,
            period,
        },
    });
    const items = getList(data, innerSharedContent, dateSort);

    return {
        title: 'Real-time discussions in the developer community | daily.dev',
        link,
        item: items,
        description: 'Stay on top of real-time developer discussions on daily.dev. Join conversations happening now and engage with the most active community members.',
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
