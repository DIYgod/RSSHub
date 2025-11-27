import type { Route } from '@/types';
import { ViewType } from '@/types';

import { baseUrl, getData, getList, variables } from './utils.js';

const sourceQuery = `
query Source($handle: ID!) {
    source(id: $handle) {
      ...SquadBaseInfo
      moderationPostCount
    }
  }
  fragment SquadBaseInfo on Source {
    ...SourceBaseInfo
    referralUrl
    createdAt
    flags {
      featured
      totalPosts
      totalViews
      totalUpvotes
    }
    category {
      id
      title
      slug
    }
    ...PrivilegedMembers
  }
  fragment SourceBaseInfo on Source {
    id
    active
    handle
    name
    permalink
    public
    type
    description
    image
    membersCount
    currentMember {
      ...CurrentMember
    }
    memberPostingRole
    memberInviteRole
    moderationRequired
  }
  fragment CurrentMember on SourceMember {
    user {
      id
    }
    permissions
    role
    referralToken
    flags {
      hideFeedPosts
      collapsePinnedPosts
    }
  }
  fragment PrivilegedMembers on Source {
    privilegedMembers {
      user {
        id
        name
        image
        permalink
        username
        bio
        reputation
        companies {
          name
          image
        }
        contentPreference {
          status
        }
      }
      role
    }
  }

`;

const query = `
  query SourceFeed(
    $source: ID!
    $loggedIn: Boolean! = false
    $first: Int
    $after: String
    $ranking: Ranking
    $supportedTypes: [String!]
  ) {
    page: sourceFeed(
      source: $source
      first: $first
      after: $after
      ranking: $ranking
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
        pinnedAt contentHtml
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
    path: '/squads/:squads/:innerSharedContent?',
    example: '/daily/squads/watercooler',
    view: ViewType.Articles,
    parameters: {
        innerSharedContent: {
            description: 'Where to Fetch inner Shared Posts instead of original',
            default: 'false',
            options: [
                { value: 'false', label: 'False' },
                { value: 'true', label: 'True' },
            ],
        },
    },
    radar: [
        {
            source: ['app.daily.dev/squads/:squads'],
        },
    ],
    name: 'Squads',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'app.daily.dev/squads/discover',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const innerSharedContent = ctx.req.param('innerSharedContent') ? JSON.parse(ctx.req.param('innerSharedContent')) : false;
    const squads = ctx.req.param('squads');

    const link = `${baseUrl}/squads/${squads}`;

    const { id, description, name } = await getData(
        {
            query: sourceQuery,
            variables: {
                handle: squads,
            },
        },
        true
    );

    const data = await getData({
        query,
        variables: {
            ...variables,
            source: id,
            ranking: 'TIME',
            supportedTypes: ['article', 'share', 'freeform', 'video:youtube', 'collection', 'welcome'],
            first: limit,
        },
    });
    const items = getList(data, innerSharedContent, true);

    return {
        title: `${name} - daily.dev`,
        link,
        item: items,
        description,
        logo: `${baseUrl}/favicon-32x32.png`,
        icon: `${baseUrl}/favicon-32x32.png`,
        language: 'en-us',
    };
}
