import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { PostNode } from './types';

export const route: Route = {
    path: '/community/:community',
    categories: ['social-media'],
    example: '/digg/community/askdigg',
    parameters: {
        community: 'Community slug, can be found in the URL',
    },
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
            source: ['digg.com/:community'],
        },
    ],
    name: 'Community Posts',
    maintainers: ['TonyRL'],
    handler,
    url: 'digg.com/',
};

const baseUrl = 'https://digg.com';
const graphqlUrl = 'https://apineapple-prod.digg.com/graphql';

const DiggDescription = ({ node }) => {
    if (!node) {
        return null;
    }

    const children = Array.isArray(node.content) ? node.content : [];

    switch (node.type) {
        case 'bulletList':
            return (
                <ul>
                    {children.map((element, index) => (
                        <DiggDescription node={element} key={index} />
                    ))}
                </ul>
            );
        case 'listItem':
            return (
                <li>
                    {children.map((element, index) => (
                        <DiggDescription node={element} key={index} />
                    ))}
                </li>
            );

        case 'diggImagesBlock':
            if (node.attrs && Array.isArray(node.attrs.images)) {
                return (
                    <div>
                        {node.attrs.images.map((img: any, index: number) => (
                            <img src={img.url} alt="" width={img.width} height={img.height} key={index} />
                        ))}
                    </div>
                );
            }
            return null;

        case 'diggLinkBlock':
            return (
                <>
                    <a href={node.attrs.url}>
                        {node.attrs.title || node.attrs.url}
                        <br />
                        {node.attrs.description}
                    </a>
                    {node.attrs.tldr}
                </>
            );

        case 'diggTextBlock':
        case 'doc':
            return (
                <>
                    {children.map((element, index) => (
                        <DiggDescription node={element} key={index} />
                    ))}
                </>
            );

        case 'diggTitleBlock':
            return null;

        case 'hardBreak':
            return <br />;

        case 'mention':
            return <a href={`${baseUrl}/${node.attrs.label}`}>/{node.attrs.label}</a>;

        case 'paragraph':
            if (children.length === 0) {
                return null;
            }
            return (
                <p>
                    {children.map((element, index) => (
                        <DiggDescription node={element} key={index} />
                    ))}
                    <br />
                </p>
            );

        case 'text':
            return node.text || '';

        default:
            throw new Error(`Unknown node type: ${node.type}`);
    }
};

async function handler(ctx) {
    const { community } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') ?? 30, 10);

    const communityData = await cache.tryGet(`digg:community:${community}`, async () => {
        const {
            data: { community: communityData },
        } = await ofetch(graphqlUrl, {
            method: 'POST',
            body: {
                query: `query CommunityQuery($id: ID, $slug: String) {
  community(where: { _id_EQ: $id, slug_EQ: $slug }) {
    ...CommunityFragment
    topContributors {
      account {
        _id
        avatarUrl
        avatarImage {
          ...ImageFragment
        }
        username
      }
      score
    }
    topGemFinders {
      account {
        _id
        avatarUrl
        avatarImage {
          ...ImageFragment
        }
        username
      }
      score
    }
  }
}
fragment AuthorFragment on Account {
  _id
  username
  avatarUrl
  avatarImage {
    ...ImageFragment
  }
  badges {
    name
    iconUrl
  }
  blockStatus
  roles {
    name
    iconUrl
  }
}
fragment CommunityFragment on Community {
  _id
  name
  slug
  description
  iconUrl
  guidelinesPM
  descriptionPM
  iconImage {
    ...ImageFragment
  }
  bannerUrl
  bannerDesktopImage {
    ...ImageFragment
  }
  bannerMobileImage {
    ...ImageFragment
  }
  founder {
    ...AuthorFragment
    bio
  }
  manager {
    ...AuthorFragment
  }
  memberCount
  postCount
  isJoinedByAccount
  isPinnedByAccount
  isJoinedByDefault
  createdDate
  editedDate
  deletedDate
}
fragment ImageFragment on Image {
  alt
  height
  width
  url
  blurhash
}`,
                variables: { slug: community },
            },
        });

        return communityData;
    });

    const {
        data: { posts },
    } = await ofetch(graphqlUrl, {
        method: 'POST',
        body: {
            query: `query PostsQuery(
  $first: Int
  $after: String
  $where: PostWhere
  $sort: PostSort
) {
  posts(first: $first, after: $after, where: $where, sort: $sort) {
    edges {
      node {
        ...PostsNodeFragment
      }
    }
    pageInfo {
      ...PageInfoFragment
    }
  }
}
fragment AuthorFragment on Account {
  _id
  username
  avatarUrl
  avatarImage {
    ...ImageFragment
  }
  badges {
    name
    iconUrl
  }
  blockStatus
  roles {
    name
    iconUrl
  }
}
fragment CommunityFragment on Community {
  _id
  name
  slug
  description
  iconUrl
  guidelinesPM
  descriptionPM
  iconImage {
    ...ImageFragment
  }
  bannerUrl
  bannerDesktopImage {
    ...ImageFragment
  }
  bannerMobileImage {
    ...ImageFragment
  }
  founder {
    ...AuthorFragment
    bio
  }
  manager {
    ...AuthorFragment
  }
  memberCount
  postCount
  isJoinedByAccount
  isPinnedByAccount
  isJoinedByDefault
  createdDate
  editedDate
  deletedDate
}
fragment ImageFragment on Image {
  alt
  height
  width
  url
  blurhash
}
fragment ModerationReasonFragment on ModerationRemovalReason {
  id
  key
  description
  message
  type
  createdDate
  editedDate
  deletedDate
}
fragment PageInfoFragment on PageInfo {
  endCursor
  hasNextPage
  hasPreviousPage
  startCursor
}
fragment PostsNodeFragment on Post {
  _id
  title
  isSavedByAccount
  moderationStatus
  isDuggByAccount
  voteDirectionByAccount
  upvoteCount
  downvoteCount
  score
  reportByAccount
  slug
  type
  externalContent {
    url
    headline
    subHeadline
    imageUrl
    iconUrl
  }
  commentCount
  shareCount
  textPreview
  contextCards {
    tldr {
      text
    }
  }
  community {
    ...CommunityFragment
  }
  attachments {
    __typename
    ... on Image {
      ...ImageFragment
    }
  }
  author {
    ...AuthorFragment
  }
  createdDate
  editedDate
  deletedDate
  nsfw
  text
  pm
  moderatedDate
  moderationReason {
    ...ModerationReasonFragment
  }
}`,
            variables: { first: limit, where: { community: { slug_EQ: community } }, sort: 'RECENT' },
        },
    });

    const items = posts.edges.map(({ node }: { node: PostNode }) => ({
        title: node.title,
        description: renderToString(<DiggDescription node={node.pm} />),
        link: `${baseUrl}/${node._id.replaceAll('-', '/')}/${node.slug}`,
        pubDate: parseDate(node.createdDate),
        author: node.author.username,
    }));

    return {
        title: `${communityData.name} Community | Digg | Digg`,
        description: communityData.description,
        image: communityData.iconUrl,
        link: `${baseUrl}/${community}`,
        item: items,
    };
}
