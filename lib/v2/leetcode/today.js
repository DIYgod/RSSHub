const got = require('@/utils/got');
const showdown = require('showdown');
module.exports = async (ctx) => {
    const url = `https://leetcode-cn.com/graphql/`;
    const headers = {
        Referer: `https://leetcode-cn.com/problemset/all/`,
        UserAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36`,
        Origin: `https://leetcode-cn.com`,
    };
    // 获取每日一题
    const data = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionOfToday',
                query: '\n    query questionOfToday {\n  todayRecord {\n    date\n    userStatus\n    question {\n      questionId\n      frontendQuestionId: questionFrontendId\n      difficulty\n      title\n      titleCn: translatedTitle\n      titleSlug\n      paidOnly: isPaidOnly\n      freqBar\n      isFavor\n      acRate\n      status\n      solutionNum\n      hasVideoSolution\n      topicTags {\n        name\n        nameTranslated: translatedName\n        id\n      }\n      extra {\n        topCompanyTags {\n          imgUrl\n          slug\n          numSubscribed\n        }\n      }\n    }\n    lastSubmission {\n      id\n    }\n  }\n}\n    ',
                variables: {},
            },
            headers,
        })
    ).data.data;
    const questionTitle = data.todayRecord[0].question.titleSlug;
    const questionUrl = `https://leetcode-cn.com/problems/${questionTitle}/`;

    // 获取题目内容
    const question = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionData',
                query: 'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    categoryTitle\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    langToValidPlayground\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    envInfo\n    book {\n      id\n      bookName\n      pressName\n      source\n      shortDescription\n      fullDescription\n      bookImgUrl\n      pressImgUrl\n      productUrl\n      __typename\n    }\n    isSubscribed\n    isDailyQuestion\n    dailyRecordStatus\n    editorType\n    ugcQuestionId\n    style\n    exampleTestcases\n    __typename\n  }\n}\n',
                variables: {
                    titleSlug: questionTitle,
                },
            },
            headers,
        })
    ).data.data.question;
    // 获取题解（前3）
    const articles = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionSolutionArticles',
                query: 'query questionSolutionArticles($questionSlug: String!, $skip: Int, $first: Int, $orderBy: SolutionArticleOrderBy, $userInput: String, $tagSlugs: [String!]) {\n  questionSolutionArticles(questionSlug: $questionSlug, skip: $skip, first: $first, orderBy: $orderBy, userInput: $userInput, tagSlugs: $tagSlugs) {\n    totalNum\n    edges {\n      node {\n        ...solutionArticle\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment solutionArticle on SolutionArticleNode {\n  rewardEnabled\n  canEditReward\n  uuid\n  title\n  slug\n  sunk\n  chargeType\n  status\n  identifier\n  canEdit\n  canSee\n  reactionType\n  reactionsV2 {\n    count\n    reactionType\n    __typename\n  }\n  tags {\n    name\n    nameTranslated\n    slug\n    tagType\n    __typename\n  }\n  createdAt\n  thumbnail\n  author {\n    username\n    profile {\n      userAvatar\n      userSlug\n      realName\n      __typename\n    }\n    __typename\n  }\n  summary\n  topic {\n    id\n    commentCount\n    viewCount\n    __typename\n  }\n  byLeetcode\n  isMyFavorite\n  isMostPopular\n  isEditorsPick\n  hitCount\n  videosInfo {\n    videoId\n    coverUrl\n    duration\n    __typename\n  }\n  __typename\n}\n',
                variables: {
                    questionSlug: questionTitle,
                    first: 3,
                    skip: 0,
                    orderBy: 'DEFAULT',
                },
            },
            headers,
        })
    ).data.data.questionSolutionArticles.edges;
    // 获取题解内容
    const articleContent = (
        await Promise.all(
            articles.map((art) =>
                got({
                    method: 'post',
                    url,
                    json: {
                        operationName: 'solutionDetailArticle',
                        query: 'query solutionDetailArticle($slug: String!, $orderBy: SolutionArticleOrderBy!) {\n  solutionArticle(slug: $slug, orderBy: $orderBy) {\n    ...solutionArticle\n    content\n    question {\n      questionTitleSlug\n      __typename\n    }\n    position\n    next {\n      slug\n      title\n      __typename\n    }\n    prev {\n      slug\n      title\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment solutionArticle on SolutionArticleNode {\n  rewardEnabled\n  canEditReward\n  uuid\n  title\n  slug\n  sunk\n  chargeType\n  status\n  identifier\n  canEdit\n  canSee\n  reactionType\n  reactionsV2 {\n    count\n    reactionType\n    __typename\n  }\n  tags {\n    name\n    nameTranslated\n    slug\n    tagType\n    __typename\n  }\n  createdAt\n  thumbnail\n  author {\n    username\n    profile {\n      userAvatar\n      userSlug\n      realName\n      __typename\n    }\n    __typename\n  }\n  summary\n  topic {\n    id\n    commentCount\n    viewCount\n    __typename\n  }\n  byLeetcode\n  isMyFavorite\n  isMostPopular\n  isEditorsPick\n  hitCount\n  videosInfo {\n    videoId\n    coverUrl\n    duration\n    __typename\n  }\n  __typename\n}\n',
                        variables: {
                            slug: art.node.slug,
                            orderBy: 'DEFAULT',
                        },
                    },
                    headers,
                })
            )
        )
    ).map((v) => v.data.data.solutionArticle);
    const converter = new showdown.Converter();
    const handleText = (s) => {
        // 处理多语言代码展示问题
        s = s.replace(/(```)([a-zA-Z0-9-+#]+)\s*?(\[.*?\])?\n/g, '\r\n###$2\r\n $1$2\r\n');
        return s;
    };
    ctx.state.data = {
        title: 'LeetCode Today',
        description: 'LeetCode 每日一题',
        link: questionUrl,
        item: [
            {
                title: `每日一题-${question.translatedTitle}`,
                link: questionUrl,
                description: question.translatedContent,
                pubDate: data.todayRecord[0].date + ' 00:00:00',
            },
            ...articleContent.map((art, i) => ({
                title: art.title,
                link: `${questionUrl}/solution/${art.slug}`,
                description: converter.makeHtml(handleText(art.content)),
                pubDate: articles[i].node.createdAt,
                author: art.author.username,
            })),
        ],
    };
};
