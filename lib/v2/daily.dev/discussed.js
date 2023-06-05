const { getList, getRedirectedLink } = require('./utils.js');
const logger = require('@/utils/logger');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'https://app.daily.dev/discussed';
    const data = (
        await got
            .post('https://app.daily.dev/api/graphql', {
                json: {
                    "query": "\n  query MostDiscussedFeed(\n    $loggedIn: Boolean! = false\n    $first: Int\n    $after: String\n    $supportedTypes: [String!] = [\"article\",\"share\",\"freeform\"]\n  ) {\n    page: mostDiscussedFeed(first: $first, after: $after, supportedTypes: $supportedTypes) {\n      ...FeedPostConnection\n    }\n  }\n  \n  fragment FeedPostConnection on PostConnection {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    edges {\n      node {\n        ...FeedPost\n        \n        ...UserPost @include(if: $loggedIn)\n      }\n    }\n  }\n  \n  fragment FeedPost on Post {\n    ...SharedPostInfo\n    sharedPost {\n      ...SharedPostInfo\n    }\n    trending\n    feedMeta\n  }\n  \n  fragment SharedPostInfo on Post {\n    id\n    title\n    image\n    readTime\n    permalink\n    commentsPermalink\n    summary\n    createdAt\n    private\n    upvoted\n    commented\n    bookmarked\n    numUpvotes\n    numComments\n    scout {\n      ...UserShortInfo\n    }\n    author {\n      ...UserShortInfo\n    }\n    type\n    tags\n    source {\n      ...SourceBaseInfo\n    }\n  }\n  \n  fragment SourceBaseInfo on Source {\n    id\n    active\n    handle\n    name\n    permalink\n    public\n    type\n    description\n    image\n    membersCount\n    currentMember {\n      ...CurrentMember\n    }\n    memberPostingRole\n    memberInviteRole\n  }\n  \n  fragment CurrentMember on SourceMember {\n    user {\n      id\n    }\n    permissions\n    role\n    referralToken\n  }\n\n\n  \n  fragment UserShortInfo on User {\n    id\n    name\n    image\n    permalink\n    username\n    bio\n  }\n\n\n\n  \n  fragment UserPost on Post {\n    read\n    upvoted\n    commented\n    bookmarked\n  }\n\n\n",
                    "variables": {
                        "version": 11,
                        "first": 15,
                        "loggedIn": false
                    }
                },
            })
            .json()
    ).data.page.edges;

    logger.debug(`Requesting ${baseUrl}`);
    const list = getList(data);
    const items = await getRedirectedLink(list);

    ctx.state.data = {
        title: 'Most Discussed',
        link: baseUrl,
        item: items,
        description: 'Most Discussed Posts on Daily.dev',
        logo: 'https://app.daily.dev/favicon-32x32.png',
        icon: 'https://app.daily.dev/favicon-32x32.png',
        language: 'en-us',
    };
};
