import { Route } from '@/types';
import { baseUrl, getData, getList, variables } from './utils.js';

const query = `
  query AnonymousFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $version: Int
    $supportedTypes: [String!] = ["article","share","freeform","video:youtube","collection"]
  ) {
    page: anonymousFeed(
      first: $first
      after: $after
      ranking: $ranking
      version: $version
      supportedTypes: $supportedTypes
    ) {
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
    path: '/popular',
    example: '/daily/popular',
    radar: [
        {
            source: ['app.daily.dev/popular'],
        },
    ],
    name: 'Popular',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/popular',
    features: {
        requireConfig: [
            {
                name: 'DAILY_DEV_INNER_SHARED_CONTENT',
                description: 'Retrieve the content from shared posts rather than original post content',
                optional: true,
            },
        ],
    },
};

async function handler(ctx) {
    const link = `${baseUrl}/posts`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;
    const data = await getData({
        query,
        variables: {
            ...variables,
            ranking: 'POPULARITY',
            first: limit,
        },
    });
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
