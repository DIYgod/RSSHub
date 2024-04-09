import { Route } from '@/types';
import { getData, getList, getRedirectedLink } from './utils.js';

const variables = {
    first: 15,
};

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
    path: '/discussed',
    categories: ['social-media'],
    example: '/daily/discussed',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['daily.dev/popular'],
            target: '',
        },
    ],
    name: 'Most Discussed',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'daily.dev/popular',
};

async function handler() {
    const baseUrl = 'https://app.daily.dev/discussed';
    const data = await getData(graphqlQuery);
    const list = getList(data);
    const items = await getRedirectedLink(list);
    return {
        title: 'Most Discussed',
        link: baseUrl,
        item: items,
        description: 'Most Discussed Posts on Daily.dev',
        logo: 'https://app.daily.dev/favicon-32x32.png',
        icon: 'https://app.daily.dev/favicon-32x32.png',
        language: 'en-us',
    };
}
