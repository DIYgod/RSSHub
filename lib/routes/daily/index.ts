import { Route } from '@/types';
import { baseUrl, getData, getList } from './utils.js';

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

const graphqlQuery = {
    query,
    variables,
};

export const route: Route = {
    path: '/',
    example: '/daily',
    radar: [
        {
            source: ['app.daily.dev/popular'],
        },
    ],
    name: 'Popular',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/popular',
};

async function handler() {
    const link = `${baseUrl}/popular`;

    const data = await getData(graphqlQuery);
    const items = getList(data);

    return {
        title: 'Popular posts on daily.dev',
        link,
        item: items,
        description: 'daily.dev is the easiest way to stay updated on the latest programming news. Get the best content from the top tech publications on any topic you want.',
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
