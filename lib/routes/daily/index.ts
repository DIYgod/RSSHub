// @ts-nocheck
const { getData, getList, getRedirectedLink } = require('./utils.js');

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

export default async (ctx) => {
    const baseUrl = 'https://app.daily.dev/popular';
    const data = await getData(graphqlQuery);
    const list = getList(data);
    const items = await getRedirectedLink(list);
    ctx.set('data', {
        title: 'Popular',
        link: baseUrl,
        item: items,
        description: 'Popular Posts on Daily.dev',
        logo: 'https://app.daily.dev/favicon-32x32.png',
        icon: 'https://app.daily.dev/favicon-32x32.png',
        language: 'en-us',
    });
};
