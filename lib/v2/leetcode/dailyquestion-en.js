const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

const host = 'https://leetcode.com';

module.exports = async (ctx) => {
    const question = {
        date: '',
        link: '',
        titleSlug: '',
        content: '',
        frontedId: '',
        difficulty: '',
        tags: '',
    };
    const url = host + '/graphql';
    const dailyQuestionPayload = {
        query: `\n    query questionOfToday {\n  activeDailyCodingChallengeQuestion {\n    date\n    userStatus\n    link\n    question {\n      acRate\n      difficulty\n      freqBar\n      frontendQuestionId: questionFrontendId\n      isFavor\n      paidOnly: isPaidOnly\n      status\n      title\n      titleSlug\n      hasVideoSolution\n      hasSolution\n      topicTags {\n        name\n        id\n        slug\n      }\n    }\n  }\n}\n    `,
        variables: {},
    };
    const dailyQuestionResponse = await got({
        method: 'post',
        url,
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(dailyQuestionPayload),
    });
    const data = dailyQuestionResponse.data.data.activeDailyCodingChallengeQuestion;
    question.date = data.date;
    question.link = host + data.link;
    question.titleSlug = data.question.titleSlug;

    const detailsPayload = {
        operationName: 'questionData',
        query: `query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    exampleTestcases\n    categoryTitle\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      paidOnly\n      hasVideoSolution\n      paidOnlyVideo\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    enableDebugger\n    envInfo\n    libraryUrl\n    adminUrl\n    challengeQuestion {\n      id\n      date\n      incompleteChallengeCount\n      streakCount\n      type\n      __typename\n    }\n    __typename\n  }\n}\n`,
        variables: {
            titleSlug: question.titleSlug,
        },
    };
    const detailsResponse = await got({
        method: 'post',
        url,
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(detailsPayload),
    });
    const emoji = {
        Medium: '🟡',
        Easy: '🟢',
        Hard: '🔴',
    };

    const details = detailsResponse.data.data.question;
    question.content = details.content;
    question.frontedId = details.questionFrontendId;
    question.difficulty = emoji[details.difficulty];

    let topicTags = details.topicTags;
    topicTags = topicTags.map((item) => {
        let slug = '#' + item.slug;
        slug = slug.replaceAll('-', '_');
        return slug;
    });
    question.tags = topicTags.join(' ');

    const rssData = {
        title: question.frontedId + '.' + question.titleSlug,
        description: art(path.join(__dirname, 'templates/question-description.art'), {
            question,
        }),
        link: question.link,
    };

    ctx.state.data = {
        title: 'LeetCode Daily Question',
        link: 'https://leetcode.com',
        description: 'Leetcode Daily Question',
        item: [
            {
                title: rssData.title,
                description: rssData.description + question.content,
                link: rssData.link,
            },
        ],
    };
};
