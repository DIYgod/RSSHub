import { DataItem, Route } from '@/types';
import { baseUrl, getBuildId, getData, getList } from './utils';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';

interface Source {
    id: string;
    name: string;
    handle: string;
    image: string;
    permalink: string;
    description: string;
    type: string;
}

const sourceFeedQuery = `
query SourceFeed($source: ID!, $loggedIn: Boolean! = false, $first: Int, $after: String, $ranking: Ranking, $supportedTypes: [String!]) {
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
      pinnedAt
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
}

fragment UserPost on Post {
  read
  upvoted
  commented
  bookmarked
  downvoted
}`;

export const route: Route = {
    path: '/source/:sourceId/:innerSharedContent?',
    example: '/daily/source/hn',
    parameters: {
        sourceId: 'The source id',
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
            source: ['app.daily.dev/sources/:sourceId'],
        },
    ],
    name: 'Source Posts',
    maintainers: ['TonyRL'],
    handler,
    url: 'app.daily.dev',
};

async function handler(ctx) {
    const sourceId = ctx.req.param('sourceId');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;
    const innerSharedContent = ctx.req.param('innerSharedContent') ? JSON.parse(ctx.req.param('innerSharedContent')) : false;

    const link = `${baseUrl}/sources/${sourceId}`;
    const buildId = await getBuildId();

    const userData = (await cache.tryGet(`daily:source:${sourceId}`, async () => {
        const response = await ofetch(`${baseUrl}/_next/data/${buildId}/en/sources/${sourceId}.json`);
        return response.pageProps.source;
    })) as Source;

    const items = await cache.tryGet(
        `daily:source:${sourceId}:posts`,
        async () => {
            const edges = await getData({
                query: sourceFeedQuery,
                variables: {
                    source: sourceId,
                    supportedTypes: ['article', 'video:youtube', 'collection'],
                    period: 30,
                    first: limit,
                    after: '',
                    loggedIn: false,
                },
            });
            return getList(edges, innerSharedContent, true);
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${userData.name} posts on daily.dev`,
        description: userData.description,
        link,
        item: items as DataItem[],
        image: userData.image,
        logo: userData.image,
        icon: userData.image,
        language: 'en-us',
    };
}
