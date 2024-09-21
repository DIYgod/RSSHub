import { Route } from '@/types';
import { baseUrl, getBuildId, getData } from './utils';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

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

const render = (data) => art(path.join(__dirname, 'templates/posts.art'), data);

export const route: Route = {
    path: '/user/:userId',
    example: '/daily/user/kramer',
    radar: [
        {
            source: ['daily.dev/:userId/posts', 'daily.dev/:userId'],
        },
    ],
    name: 'User Posts',
    maintainers: ['TonyRL'],
    handler,
    url: 'daily.dev',
};

async function handler(ctx) {
    const userId = ctx.req.param('userId');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 7;

    const buildId = await getBuildId();

    const userData = await cache.tryGet(`daily:user:${userId}`, async () => {
        const resposne = await ofetch(`${baseUrl}/_next/data/${buildId}/en/${userId}.json`, {
            query: {
                userId,
            },
        });
        return resposne.pageProps;
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
            return edges.map(({ node }) => ({
                title: node.title,
                description: render({
                    image: node.image,
                    content: node.contentHtml?.replaceAll('\n', '<br>') ?? node.summary,
                }),
                link: node.permalink,
                author: node.author?.name,
                category: node.tags,
                pubDate: parseDate(node.createdAt),
            }));
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${user.name} | daily.dev`,
        description: user.bio,
        link: `${baseUrl}/${userId}/posts`,
        item: items,
        image: user.image,
        logo: user.image,
        icon: user.image,
        language: 'en-us',
    };
}
