import { Route } from '@/types';
import { baseUrl, getData, getList } from './utils.js';

const variables = {
    period: 7,
    first: 15,
};

const query = `
  query MostUpvotedFeed(
    $first: Int
    $period: Int
    $supportedTypes: [String!] = ["article","share","freeform"]
  ) {
    page: mostUpvotedFeed(first: $first, period: $period, supportedTypes: $supportedTypes) {
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
    path: '/upvoted',
    example: '/daily/upvoted',
    radar: [
        {
            source: ['app.daily.dev/upvoted'],
        },
    ],
    name: 'Most upvoted',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/upvoted',
};

async function handler() {
    const link = `${baseUrl}/upvoted`;
    const data = await getData({
        query,
        variables,
    });
    const items = getList(data);

    return {
        title: 'Most upvoted posts for developers | daily.dev',
        link,
        item: items,
        description: 'Find the most upvoted developer posts on daily.dev. Explore top-rated content in coding, tutorials, and tech news from the largest developer network in the world.',
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
