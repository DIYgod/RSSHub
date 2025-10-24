import { DataItem, Route } from '@/types';
import { baseUrl, getBuildId, getData, getList } from './utils';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';

const userPostQuery = `
  query AuthorFeed(
    $loggedIn: Boolean! = false
    $userId: ID!
    $after: String
    $first: Int
    $supportedTypes: [String!] = [
      "article"
      "share"
      "freeform"
      "video:youtube"
      "collection"
    ]
  ) {
    page: authorFeed(
      author: $userId
      after: $after
      first: $first
      ranking: TIME
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
    ...SharedPostInfo
    sharedPost {
      ...SharedPostInfo
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
  fragment SharedPostInfo on Post {
    id
    title
    titleHtml
    image
    readTime
    permalink
    commentsPermalink
    summary
    createdAt
    private
    upvoted
    commented
    bookmarked
    views
    numUpvotes
    numComments
    videoId
    scout {
      ...UserShortInfo
    }
    author {
      ...UserShortInfo
    }
    type
    tags
    source {
      ...SourceBaseInfo
    }
    downvoted
    flags {
      promoteToPublic
    }
    userState {
      vote
      flags {
        feedbackDismiss
      }
    }
    slug
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
    privilegedMembers {
      user {
        id
      }
      role
    }
    currentMember {
      ...CurrentMember
    }
    memberPostingRole
    memberInviteRole
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
  fragment UserShortInfo on User {
    id
    name
    image
    permalink
    username
    bio
    createdAt
    reputation
  }
  fragment UserPost on Post {
    read
    upvoted
    commented
    bookmarked
    downvoted
  }`;

export const route: Route = {
    path: '/user/:userId/:innerSharedContent?',
    example: '/daily/user/kramer',
    radar: [
        {
            source: ['app.daily.dev/:userId/posts', 'app.daily.dev/:userId'],
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
    },
    name: 'User Posts',
    maintainers: ['TonyRL'],
    handler,
    url: 'app.daily.dev',
};

async function handler(ctx) {
    const userId = ctx.req.param('userId');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 7;
    const innerSharedContent = ctx.req.param('innerSharedContent') ? JSON.parse(ctx.req.param('innerSharedContent')) : false;
    const buildId = await getBuildId();

    const userData = await cache.tryGet(`daily:user:${userId}`, async () => {
        const response = await ofetch(`${baseUrl}/_next/data/${buildId}/en/${userId}.json`, {
            query: {
                userId,
            },
        });
        return response.pageProps;
    });
    const user = (userData as any).user;

    const items = await cache.tryGet(
        `daily:user:${userId}:posts`,
        async () => {
            const edges = await getData({
                query: userPostQuery,
                variables: {
                    userId: user.id,
                    first: limit,
                    loggedIn: false,
                },
            });
            return getList(edges, innerSharedContent, true);
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${user.name} | daily.dev`,
        description: user.bio,
        link: `${baseUrl}/${userId}/posts`,
        item: items as DataItem[],
        image: user.image,
        logo: user.image,
        icon: user.image,
        language: 'en-us',
    };
}
