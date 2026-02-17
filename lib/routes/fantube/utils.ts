import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { CreatorFragment, PostReelNode } from './types';

export const baseUrl = 'https://www.fantube.tokyo';

export const getCreatorFragment = (username: string) =>
    cache.tryGet(`fantube:creator:${username}`, async () => {
        const response = await ofetch(`${baseUrl}/r18/creator/${username}`, {
            headers: {
                cookie: 'fantube-ageVerified=1;',
            },
        });
        const $ = load(response);

        const selfPushString = JSON.parse(
            $('script:contains("creatorFragment")')
                .text()
                .match(/^self\.__next_f\.push\((.+?)\)$/)?.[1] || '{}'
        );
        const selfPushData = JSON.parse(selfPushString[1].slice(2));
        // const creatorFragment = selfPushData[3].children.find((c) => c[1] === 'div')[3].children[3].creatorFragment;
        const creatorFragment = selfPushData
            .find((d) => d?.hasOwnProperty('children'))
            .children.find((child) => Object.values(child).includes('div'))
            .find((c) => c?.hasOwnProperty('children'))
            .children.find((c) => c?.hasOwnProperty('creatorFragment')).creatorFragment;

        return creatorFragment as CreatorFragment;
    });

export const getCreatorPostReelList = (identifier: string, limit: number): Promise<PostReelNode[]> =>
    cache.tryGet(`fantube:creatorPostReelList:${identifier}:${limit}`, async () => {
        const response = await ofetch('https://api.prd.fantube.tokyo/graphql', {
            headers: {
                Referer: baseUrl,
            },
            body: JSON.stringify({
                query: `query CreatorPostReelList($identifier: String!, $first: Int, $after: String, $last: Int, $before: String) {
  posts(
    where: {status: {equals: PUBLISHED}, creator: {is: {identifier: {equals: $identifier}}}}
    orderBy: [{pinnedAt: {nulls: last, sort: desc}}, {order: asc}, {createdAt: desc}, {id: desc}]
    first: $first
    after: $after
    last: $last
    before: $before
  ) {
    nodes {
      ...PostSwiper_Post
    }
    pageInfo {
      hasNextPage
      endCursor
      hasPreviousPage
      startCursor
    }
  }
}

fragment PostSwiper_Post on Post {
  id
  title
  isFavorite
  favoritesCount
  ...PostSwiperSlide_Post
}

fragment PostSwiperSlide_Post on Post {
  id
  type
  title
  price
  creator {
    displayName
  }
  ...PostVideoElement_Post
  ...PostImageElement_Post
}

fragment PostVideoElement_Post on Post {
  id
  title
  contentData {
    ... on PostVideoType {
      __typename
      videoUrl
      isSample
      noSample
      durationSeconds
    }
  }
  isFavorite
  sampleVideoId
  thumbnailUrl
  creator {
    displayName
  }
  ...PostInfo_Post
  ...VideoControlIcons_Post
  ...PurchaseWrapper_Post
}

fragment PostInfo_Post on Post {
  title
  description
  publishStartAt
  price
  isBuyEnabled
  ...Profile_Post
}

fragment Profile_Post on Post {
  id
  creator {
    id
    isSelf
    identifier
    displayName
    avatarImageUrl
    following
  }
}

fragment VideoControlIcons_Post on Post {
  id
  isMine
  pinnedAt
  favoritesCount
  ...PostComment_Post
}

fragment PostComment_Post on Post {
  id
  isMine
  canComment
  comments(
    where: {OR: [{parentPostComment: {is: {isDeleted: {equals: false}}}}, {parentPostCommentId: {equals: null}}], isDeleted: {equals: false}}
  ) {
    totalCount
  }
  ...PostCommentReplyDrawer_Post
}

fragment PostCommentReplyDrawer_Post on Post {
  id
  isMine
  canComment
}

fragment PurchaseWrapper_Post on Post {
  id
  title
  price
  creator {
    displayName
  }
  ...PostPurchaseDialog_Post
  ...PostPurchaseSingleDialog_Post
}

fragment PostPurchaseDialog_Post on Post {
  id
  isBuyEnabled
  price
  thumbnailUrl
  title
  planPosts(
    orderBy: [{plan: {deleteRequestAt: {sort: desc, nulls: first}}}, {plan: {isRecommended: desc}}, {plan: {price: asc}}]
  ) {
    nodes {
      plan {
        id
        title
        price
        ...PlanSwiper_Plan
      }
    }
  }
  creator {
    displayName
  }
  ...PostPurchaseSingleDialog_Post
}

fragment PlanSwiper_Plan on Plan {
  id
  ...PlanSwiperItem_Plan
}

fragment PlanSwiperItem_Plan on Plan {
  id
  title
  price
  isArchive
  isRecommended
  deleteRequestAt
  isSubscribing
  subscriptionCloseAt
  capacity
  subscribersCount
  planPosts(
    where: {post: {is: {status: {equals: PUBLISHED}}}}
    first: 7
    orderBy: [{createdAt: desc}]
  ) {
    nodes {
      post {
        id
        thumbnailUrl
        title
      }
    }
    totalCount
  }
  ...PlanUnavailableNote_Plan
}

fragment PlanUnavailableNote_Plan on Plan {
  capacity
  subscribersCount
  subscriptionCloseAt
  deleteRequestAt
}

fragment PostPurchaseSingleDialog_Post on Post {
  id
  price
  thumbnailUrl
  title
  isBuyEnabled
}

fragment PostImageElement_Post on Post {
  id
  title
  contentData {
    __typename
    ... on PostImageType {
      encrypted
      imageUrls
      count
    }
  }
  isFavorite
  creator {
    displayName
  }
  ...PostInfo_Post
  ...ImageControlIcons_Post
  ...PurchaseWrapper_Post
}

fragment ImageControlIcons_Post on Post {
  id
  isMine
  pinnedAt
  favoritesCount
  ...PostComment_Post
}`,
                variables: { identifier, first: limit, after: '' },
                operationName: 'CreatorPostReelList',
            }),
            method: 'POST',
        });

        return response.data.posts.nodes as PostReelNode[];
    });
