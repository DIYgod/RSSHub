// @ts-nocheck
import got from '@/utils/got';
const md = require('markdown-it')({
    html: true,
    breaks: true,
});
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as path from 'node:path';
export default async (ctx) => {
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
    if (article.content === null) {
        article.content = 'Sorry, the solution of this question may be locked.';
    }

    // 图片处理
    const parsePngSlide = async (s) => {
        const pattern = /!\?!(.+)!\?!/;
        if (!pattern.test(s)) {
            return s;
        }
        const matched = s.match(new RegExp(pattern, 'g'));
        const fn = async (m) => {
            const relaurl = m.match(pattern)[1].split(':')[0];
            const fullurl = path.resolve('/' + questionUrl + 'solution/', relaurl).slice(1);
            const pngList = (
                await got({
                    url: fullurl,
                    method: 'get',
                    headers,
                })
            ).data.timeline;
            return pngList.map((v) => `![pic](${path.resolve(`/problems/${questionTitle}/solution/`, v.image)})`).join('\n');
        };
        const strs = await Promise.all(matched.map((v) => fn(v)));
        for (const [i, element] of matched.entries()) {
            s = s.replace(element, strs[i]);
        }
        return s;
    };
    // iframe代码框处理
    const parseIframe = async (s) => {
        const pattern = /<iframe.*? src=".*?playground\/(.*?)\/shared".*<\/iframe>/;
        if (!pattern.test(s)) {
            return s;
        }
        const matched = s.match(new RegExp(pattern, 'g'));
        const fn = async (m) => {
            const uuid = m.match(pattern)[1];
            const code = (
                await got({
                    method: 'post',
                    url,
                    json: {
                        operationName: 'fetchPlayground',
                        query: `query fetchPlayground {
                            playground(uuid: "${uuid}") {
                              testcaseInput
                              name
                              isUserOwner
                              isLive
                              showRunCode
                              showOpenInPlayground
                              selectedLangSlug
                              isShared
                              __typename
                            }
                            allPlaygroundCodes(uuid: "${uuid}") {
                              code
                              langSlug
                              __typename
                            }
                          }`,
                        variables: {},
                    },
                    headers,
                })
            ).data.data.allPlaygroundCodes;
            return code.map((c) => `###${c.langSlug}\n\r \`\`\`${c.langSlug}\n ${c.code}\n\`\`\``).join('\n\r');
        };
        const strs = await Promise.all(matched.map((v) => fn(v)));
        for (const [i, element] of matched.entries()) {
            s = s.replace(element, strs[i]);
        }
        return s;
    };
    const handleText = async (s) => {
        // 处理代码iframe嵌入问题
        s = await parseIframe(s);
        // 处理图片展示问题
        s = await parsePngSlide(s);
        return s;
    };
    article.content = await handleText(article.content);
    ctx.set('data', {
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
                description: md.render(article.content),
                pubDate: timezone(parseDate(data.activeDailyCodingChallengeQuestion.date), +8),
                author: 'leetcode',
            },
        ],
    });
};
