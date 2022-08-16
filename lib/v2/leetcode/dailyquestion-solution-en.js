const got = require('@/utils/got');
const showdown = require('showdown');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
module.exports = async (ctx) => {
    const baseurl = `https://leetcode.com`;
    const url = `${baseurl}/graphql/`;
    const headers = {
        'content-type': 'application/json',
    };
    const emoji = {
        Medium: '🟡',
        Easy: '🟢',
        Hard: '🔴',
    };
    // 获取每日一题
    const data = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionOfToday',
                query: `query questionOfToday {
                            activeDailyCodingChallengeQuestion {
                                date
                                link
                                question {
                                    frontendQuestionId: questionFrontendId
                                    titleSlug
                                }
                            }
                        }`,
                variables: {},
            },
            headers,
        })
    ).data.data;
    const questionTitle = data.activeDailyCodingChallengeQuestion.question.titleSlug;
    const questionUrl = `${baseurl}/problems/${questionTitle}/`;

    // 获取题目内容
    const question = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionData',
                query: `query questionData($titleSlug: String!) {
                            question(titleSlug: $titleSlug) {
                                questionId
                                questionFrontendId
                                categoryTitle
                                boundTopicId
                                title
                                titleSlug
                                content
                                translatedTitle
                                translatedContent
                                isPaidOnly
                                difficulty
                                likes
                            }
                        }`,
                variables: {
                    titleSlug: questionTitle,
                },
            },
            headers,
        })
    ).data.data.question;
    const diffEmoji = emoji[question.difficulty] || '';
    // 获取题解（en网站仅一个题解)
    const article = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'QuestionNote',
                query: `query QuestionNote($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                      questionId
                      article
                      solution {
                        id
                        content
                        contentTypeId
                        canSeeDetail
                        paidOnly
                        hasVideoSolution
                        paidOnlyVideo
                        rating {
                          id
                          count
                          average
                          userRating {
                            score
                          }
                        }
                      }
                    }
                }`,
                variables: {
                    titleSlug: questionTitle,
                },
            },
            headers,
        })
    ).data.data.question.solution;
    const converter = new showdown.Converter();
    const handleText = (s) => {
        // 处理多语言代码展示问题
        s = s.replace(/(```)([a-zA-Z0-9-+#]+)\s*?(\[.*?\])?\n/g, '\r\n###$2\r\n$1$2\r\n');
        return s;
    };
    ctx.state.data = {
        title: 'LeetCode DailyQuestion Solution',
        description: 'LeetCode DailyQuestion Solution',
        link: questionUrl,
        item: [
            {
                title: `DailyQuestion-${question.title}${diffEmoji}`,
                link: questionUrl,
                description: question.content,
                pubDate: timezone(parseDate(data.activeDailyCodingChallengeQuestion.date), +8),
            },
            {
                title: `Solution-${question.title}`,
                link: `${questionUrl}solution/`,
                description: converter.makeHtml(handleText(article.content)),
                pubDate: timezone(parseDate(data.activeDailyCodingChallengeQuestion.date), +8),
                author: 'leetcode',
            },
        ],
    };
};
