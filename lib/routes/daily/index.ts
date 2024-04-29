import { Route } from '@/types';
import { getData, getList, getRedirectedLink } from './utils.js';

const variables = {
    version: 11,
    ranking: 'POPULARITY',
    first: 15,
};

const query = `
  query AnonymousFeed(
    $first: Int
    $ranking: Ranking
    $version: Int
    $supportedTypes: [String!] = ["article","share","freeform"]
  ) {
    page: anonymousFeed(
      first: $first
      ranking: $ranking
      version: $version
      supportedTypes: $supportedTypes
    ) {
      ...FeedPostConnection
    }
  }

  fragment FeedPostConnection on PostConnection {
    edges {
      node {
        ...FeedPost
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

const graphqlQuery = {
    query,
    variables,
};

export const route: Route = {
    path: '/',
    example: '/daily',
    radar: [
        {
            source: ['daily.dev/popular'],
        },
    ],
    name: 'Popular',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'daily.dev/popular',
};

async function handler() {
    const baseUrl = 'https://app.daily.dev/popular';
    const data = await getData(graphqlQuery);
    const list = getList(data);
    const items = await getRedirectedLink(list);
    return {
        title: 'Popular',
        link: baseUrl,
        item: items,
        description: 'Popular Posts on Daily.dev',
        logo: 'https://app.daily.dev/favicon-32x32.png',
        icon: 'https://app.daily.dev/favicon-32x32.png',
        language: 'en-us',
    };
}
