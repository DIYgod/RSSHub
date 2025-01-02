import { Route } from '@/types';
import { baseUrl, getData, getList } from './utils.js';

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
    path: '/discussed',
    example: '/daily/discussed',
    radar: [
        {
            source: ['app.daily.dev/discussed'],
        },
    ],
    name: 'Most Discussed',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/discussed',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const link = `${baseUrl}/discussed`;

    const data = await getData({
        query,
        variables: {
            first: limit,
        },
    });
    const items = getList(data);

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
