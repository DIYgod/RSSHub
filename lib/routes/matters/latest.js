const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://server.matters.news/graphql',
        json: {
            operationName: 'NewestFeed',
            variables: {
                hasArticleDigestActionAuthor: false,
                hasArticleDigestActionBookmark: true,
                hasArticleDigestActionTopicScore: false,
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: '08291b314126ef9011592f1b04652a6960fa01a5de68965451c7552188381774',
                },
            },
            query:
                'query NewestFeed($after: String, $hasArticleDigestActionAuthor: Boolean = false, $hasArticleDigestActionBookmark: Boolean = true, $hasArticleDigestActionTopicScore: Boolean = false) {\n  viewer {\n    id\n    recommendation {\n      feed: newest(input: {first: 10, after: $after}) {\n        ...FeedArticleConnection\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment FeedArticleConnection on ArticleConnection {\n  pageInfo {\n    startCursor\n    endCursor\n    hasNextPage\n    __typename\n  }\n  edges {\n    cursor\n    node {\n      ...FeedDigestArticle\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment FeedDigestArticle on Article {\n  id\n  title\n  slug\n  cover\n  summary\n  mediaHash\n  live\n  author {\n    id\n    userName\n    ...UserDigestMiniUser\n    __typename\n  }\n  ...DigestActionsArticle\n  ...FingerprintArticle\n  ...DropdownActionsArticle\n  __typename\n}\n\nfragment UserDigestMiniUser on User {\n  id\n  userName\n  displayName\n  ...AvatarUser\n  __typename\n}\n\nfragment AvatarUser on User {\n  avatar\n  __typename\n}\n\nfragment DigestActionsArticle on Article {\n  author {\n    ...UserDigestMiniUser @include(if: $hasArticleDigestActionAuthor)\n    __typename\n  }\n  createdAt\n  ...AppreciationArticle\n  ...ResponseCountArticle\n  ...BookmarkArticle @include(if: $hasArticleDigestActionBookmark)\n  ...TopicScoreArticle @include(if: $hasArticleDigestActionTopicScore)\n  ...StateActionsArticle\n  __typename\n}\n\nfragment AppreciationArticle on Article {\n  appreciationsReceivedTotal\n  __typename\n}\n\nfragment ResponseCountArticle on Article {\n  id\n  slug\n  mediaHash\n  responseCount\n  author {\n    userName\n    __typename\n  }\n  __typename\n}\n\nfragment BookmarkArticle on Article {\n  id\n  subscribed\n  __typename\n}\n\nfragment TopicScoreArticle on Article {\n  topicScore\n  __typename\n}\n\nfragment StateActionsArticle on Article {\n  state\n  __typename\n}\n\nfragment FingerprintArticle on Article {\n  id\n  dataHash\n  __typename\n}\n\nfragment DropdownActionsArticle on Article {\n  id\n  ...ArchiveButtonArticle\n  ...StickyButtonArticle\n  __typename\n}\n\nfragment StickyButtonArticle on Article {\n  id\n  sticky\n  author {\n    id\n    userName\n    __typename\n  }\n  __typename\n}\n\nfragment ArchiveButtonArticle on Article {\n  id\n  state\n  author {\n    id\n    userName\n    __typename\n  }\n  __typename\n}\n',
        },
    });

    const items = await Promise.all(
        response.data.data.viewer.recommendation.feed.edges.map(async ({ node }) => {
            const link = `https://matters.news/@${node.author.userName}/${encodeURIComponent(node.slug)}-${node.mediaHash}`;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(link);
            const $ = cheerio.load(res.data);
            const article = $('.u-content').html();
            const single = {
                title: node.title,
                link,
                description: article,
                author: node.author.userName,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Matters | 最新文章',
        item: items,
    };
};
