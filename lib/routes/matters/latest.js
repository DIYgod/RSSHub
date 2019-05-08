const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'post',
        url: 'https://server.matters.news/',
        data: {
            operationName: 'NewestFeed',
            variables: {
                hasArticleDigestActionAuthor: false,
                hasArticleDigestActionBookmark: true,
                hasArticleDigestActionTopicScore: false,
            },
            query:
                'query NewestFeed($cursor: String, $hasArticleDigestActionAuthor: Boolean = false, $hasArticleDigestActionBookmark: Boolean = true, $hasArticleDigestActionTopicScore: Boolean = false) {\n  viewer {\n    id\n    recommendation {\n      feed: newest(input: {first: 10, after: $cursor}) {\n        ...FeedArticleConnection\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment FeedArticleConnection on ArticleConnection {\n  pageInfo {\n    startCursor\n    endCursor\n    hasNextPage\n    __typename\n  }\n  edges {\n    cursor\n    node {\n      ...FeedDigestArticle\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment FeedDigestArticle on Article {\n  id\n  title\n  slug\n  cover\n  summary\n  mediaHash\n  live\n  author {\n    id\n    userName\n    ...UserDigestMiniUser\n    __typename\n  }\n  ...DigestActionsArticle\n  ...FingerprintArticle\n  __typename\n}\n\nfragment UserDigestMiniUser on User {\n  id\n  userName\n  displayName\n  ...AvatarUser\n  __typename\n}\n\nfragment AvatarUser on User {\n  avatar\n  __typename\n}\n\nfragment DigestActionsArticle on Article {\n  author {\n    ...UserDigestMiniUser @include(if: $hasArticleDigestActionAuthor)\n    __typename\n  }\n  createdAt\n  ...MATArticle\n  ...CommentCountArticle\n  ...BookmarkArticle @include(if: $hasArticleDigestActionBookmark)\n  ...TopicScoreArticle @include(if: $hasArticleDigestActionTopicScore)\n  ...StateActionsArticle\n  __typename\n}\n\nfragment MATArticle on Article {\n  MAT\n  __typename\n}\n\nfragment CommentCountArticle on Article {\n  comments(input: {first: 0}) {\n    totalCount\n    __typename\n  }\n  __typename\n}\n\nfragment BookmarkArticle on Article {\n  id\n  subscribed\n  __typename\n}\n\nfragment TopicScoreArticle on Article {\n  topicScore\n  __typename\n}\n\nfragment StateActionsArticle on Article {\n  state\n  __typename\n}\n\nfragment FingerprintArticle on Article {\n  id\n  dataHash\n  __typename\n}\n',
        },
    });

    const items = await Promise.all(
        response.data.data.viewer.recommendation.feed.edges.map(async ({ node }) => {
            const link = `https://matters.news/@${node.author.userName}/${encodeURIComponent(node.slug)}-${node.mediaHash}`;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await axios.get(link);
            const $ = cheerio.load(res.data);
            const article = $('.u-content').html();
            const single = {
                title: node.title,
                link,
                description: article,
            };

            ctx.cache.set(link, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Matters | 最新文章',
        item: items,
    };
};
