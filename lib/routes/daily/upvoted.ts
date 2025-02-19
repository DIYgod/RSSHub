import { Route, ViewType } from '@/types';
import { baseUrl, getData, getList, variables } from './utils.js';

const query = `
    query MostUpvotedFeed(
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $period: Int
    $supportedTypes: [String!] = ["article","share","freeform","video:youtube","collection"]
    $source: ID
    $tag: String
  ) {
    page: mostUpvotedFeed(first: $first, after: $after, period: $period, supportedTypes: $supportedTypes, source: $source, tag: $tag) {
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
    path: '/upvoted/:period?/:innerSharedContent?/:dateSort?',
    example: '/daily/upvoted/7',
    view: ViewType.Articles,
    radar: [
        {
            source: ['app.daily.dev/upvoted'],
        },
    ],
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
    name: 'Most upvoted',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/upvoted',
};

async function handler(ctx) {
    const link = `${baseUrl}/posts/upvoted`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const innerSharedContent = ctx.req.param('innerSharedContent') ? JSON.parse(ctx.req.param('innerSharedContent')) : false;
    const dateSort = ctx.req.param('dateSort') ? JSON.parse(ctx.req.param('dateSort')) : true;
    const period = ctx.req.param('period') ? Number.parseInt(ctx.req.param('period'), 10) : 7;

    const data = await getData({
        query,
        variables: {
            ...variables,
            period,
            first: limit,
        },
    });
    const items = getList(data, innerSharedContent, dateSort);

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
