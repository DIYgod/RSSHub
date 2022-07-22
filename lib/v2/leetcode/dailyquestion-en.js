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
        query: `query questionOfToday { activeDailyCodingChallengeQuestion { date userStatus link question { acRate difficulty freqBar frontendQuestionId: questionFrontendId isFavor paidOnly: isPaidOnly status title titleSlug hasVideoSolution hasSolution topicTags { name id slug } } }} `,
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
        query: `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId boundTopicId title titleSlug content translatedTitle translatedContent isPaidOnly difficulty likes dislikes isLiked similarQuestions exampleTestcases categoryTitle contributors { username profileUrl avatarUrl __typename } topicTags { name slug translatedName __typename } companyTagStats codeSnippets { lang langSlug code __typename } stats hints solution { id canSeeDetail paidOnly hasVideoSolution paidOnlyVideo __typename } status sampleTestCase metaData judgerAvailable judgeType mysqlSchemas enableRunCode enableTestMode enableDebugger envInfo libraryUrl adminUrl challengeQuestion { id date incompleteChallengeCount streakCount type __typename } __typename }}`,
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
