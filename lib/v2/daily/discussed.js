const { getData, getList, getRedirectedLink } = require('./utils.js');

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

module.exports = async (ctx) => {
    const baseUrl = 'https://app.daily.dev/discussed';
    const data = await getData(graphqlQuery);
    const list = getList(data);
    const items = await getRedirectedLink(list);
    ctx.state.data = {
        title: 'Most Discussed',
        link: baseUrl,
        item: items,
        description: 'Most Discussed Posts on Daily.dev',
        logo: 'https://app.daily.dev/favicon-32x32.png',
        icon: 'https://app.daily.dev/favicon-32x32.png',
        language: 'en-us',
    };
};
