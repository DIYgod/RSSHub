import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
    breaks: true,
});
export const route: Route = {
    path: '/dailyquestion/solution/en',
    categories: ['programming'],
    example: '/leetcode/dailyquestion/solution/en',
    radar: [
        {
            source: ['leetcode.com/'],
        },
    ],
    name: 'Daily Question Solution',
    maintainers: ['woaidouya123'],
    handler,
    url: 'leetcode.com/',
};

async function handler() {
    const baseurl = 'https://leetcode.com';
    const url = `${baseurl}/graphql/`;
    const headers = {
        'content-type': 'application/json',
    };
    const emoji = {
        Medium: '🟡',
        Easy: '🟢',
        Hard: '🔴',
    };
    // Fetch the daily challenge.
    const data = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionOfToday',
                query: /* GraphQL */ `
                    query questionOfToday {
                        activeDailyCodingChallengeQuestion {
                            date
                            link
                            question {
                                frontendQuestionId: questionFrontendId
                                titleSlug
                            }
                        }
                    }
                `,
                variables: {},
            },
            headers,
        })
    ).data.data;
    const questionTitle = data.activeDailyCodingChallengeQuestion.question.titleSlug;
    const questionUrl = `${baseurl}/problems/${questionTitle}/`;

    // Fetch the question content.
    const question = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionData',
                query: /* GraphQL */ `
                    query questionData($titleSlug: String!) {
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
                    }
                `,
                variables: {
                    titleSlug: questionTitle,
                },
            },
            headers,
        })
    ).data.data.question;
    const diffEmoji = emoji[question.difficulty] || '';
    // Fetch the official English solution.
    const article = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'QuestionNote',
                query: /* GraphQL */ `
                    query QuestionNote($titleSlug: String!) {
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
                    }
                `,
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

    // Expand image slides.
    const parsePngSlide = async (s) => {
        const pattern = /!\?!(.+)!\?!/;
        if (!pattern.test(s)) {
            return s;
        }
        const matched = s.match(new RegExp(pattern, 'g'));
        const fn = async (m) => {
            const relaurl = m.match(pattern)[1].split(/:(?!\/\/)/, 1)[0];
            const fullurl = new URL(relaurl, `${questionUrl}solution/`).href;
            const pngList = (
                await got({
                    url: fullurl,
                    method: 'get',
                    headers,
                })
            ).data.timeline;
            return pngList.map((v) => `![pic](${new URL(v.image, `${questionUrl}solution/`).href})`).join('\n');
        };
        const strs = await Promise.all(matched.map((v) => fn(v)));
        for (let i = 0; i < matched.length; i++) {
            s = s.replace(matched[i], () => strs[i]);
        }
        return s;
    };
    // Expand embedded playground code.
    const parseIframe = async (s) => {
        const pattern = /<iframe.*? src=".*?playground\/(.*?)\/shared".*<\/iframe>/;
        if (!pattern.test(s)) {
            return s;
        }
        const matched = s.match(new RegExp(pattern, 'g'));
        const fn = async (m) => {
            const uuid = m.match(pattern)[1];
            const code = await cache.tryGet(
                `leetcode:en:playground:${uuid}`,
                async () =>
                    (
                        await got({
                            method: 'post',
                            url,
                            json: {
                                operationName: 'fetchPlayground',
                                query: /* GraphQL */ `query fetchPlayground {
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
                    ).data.data.allPlaygroundCodes
            );
            return code.map((c) => `###${c.langSlug}\n\r \`\`\`${c.langSlug}\n ${c.code}\n\`\`\``).join('\n\r');
        };
        const strs = await Promise.all(matched.map((v) => fn(v)));
        for (let i = 0; i < matched.length; i++) {
            s = s.replace(matched[i], () => strs[i]);
        }
        return s;
    };
    const handleText = async (s) => {
        // Expand embedded playground code.
        s = await parseIframe(s);
        // Expand image slides.
        s = await parsePngSlide(s);
        return s;
    };
    article.content = await handleText(article.content);
    return {
        title: 'LeetCode DailyQuestion Solution',
        description: 'LeetCode DailyQuestion Solution',
        link: questionUrl,
        item: [
            {
                title: `DailyQuestion-${question.title}${diffEmoji}`,
                link: questionUrl,
                description: question.content,
                pubDate: data.activeDailyCodingChallengeQuestion.date ? parseDate(`${data.activeDailyCodingChallengeQuestion.date}T00:00:00Z`) : undefined,
            },
            {
                title: `Solution-${question.title}`,
                link: `${questionUrl}solution/`,
                description: md.render(article.content),
                pubDate: data.activeDailyCodingChallengeQuestion.date ? parseDate(`${data.activeDailyCodingChallengeQuestion.date}T00:00:00Z`) : undefined,
                author: 'leetcode',
            },
        ],
    };
}
