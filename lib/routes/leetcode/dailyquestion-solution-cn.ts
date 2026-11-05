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
    path: '/dailyquestion/solution/cn',
    categories: ['programming'],
    example: '/leetcode/dailyquestion/solution/cn',
    radar: [
        {
            source: ['leetcode.cn/'],
        },
    ],
    name: '每日一题题解',
    maintainers: ['woaidouya123'],
    handler,
    url: 'leetcode.cn/',
};

async function handler() {
    const baseurl = 'https://leetcode.cn';
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
                        todayRecord {
                            date
                            userStatus
                            question {
                                questionId
                                frontendQuestionId: questionFrontendId
                                difficulty
                                title
                                titleCn: translatedTitle
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
    const questionTitle = data.todayRecord[0].question.titleSlug;
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
    // Fetch the three most upvoted solutions.
    const articles = (
        await got({
            method: 'post',
            url,
            json: {
                operationName: 'questionSolutionArticles',
                query: /* GraphQL */ `
                    query questionSolutionArticles($questionSlug: String!, $skip: Int, $first: Int, $orderBy: SolutionArticleOrderBy, $userInput: String, $tagSlugs: [String!]) {
                        questionSolutionArticles(questionSlug: $questionSlug, skip: $skip, first: $first, orderBy: $orderBy, userInput: $userInput, tagSlugs: $tagSlugs) {
                            totalNum
                            edges {
                                node {
                                    ...solutionArticle
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                    }
                    fragment solutionArticle on SolutionArticleNode {
                        uuid
                        title
                        slug
                        createdAt
                        thumbnail
                        author {
                            username
                        }
                        summary
                    }
                `,
                variables: {
                    questionSlug: questionTitle,
                    first: 3,
                    skip: 0,
                    orderBy: 'MOST_UPVOTE',
                },
            },
            headers,
        })
    ).data.data.questionSolutionArticles.edges;
    // Fetch each solution body.
    const articleContent = await Promise.all(
        articles.map((art) =>
            cache.tryGet(`leetcode:cn:solution:${art.node.slug}`, async () => {
                const response = await got({
                    method: 'post',
                    url,
                    json: {
                        operationName: 'solutionDetailArticle',
                        query: /* GraphQL */ `
                            query solutionDetailArticle($slug: String!, $orderBy: SolutionArticleOrderBy!) {
                                solutionArticle(slug: $slug, orderBy: $orderBy) {
                                    ...solutionArticle
                                    content
                                    question {
                                        questionTitleSlug
                                        __typename
                                    }
                                }
                            }
                            fragment solutionArticle on SolutionArticleNode {
                                uuid
                                title
                                slug
                                createdAt
                                thumbnail
                                author {
                                    username
                                }
                                summary
                            }
                        `,
                        variables: {
                            slug: art.node.slug,
                            orderBy: 'DEFAULT',
                        },
                    },
                    headers,
                });
                return response.data.data.solutionArticle;
            })
        )
    );

    const handleText = (s) => {
        // Normalize code blocks for multiple languages.
        s = s.replaceAll(/(```)([\d#+A-Z-]+)\s*?(\[.*?\])?\n/gi, '\r\n###$2\r\n$1$2\r\n');
        return s;
    };
    return {
        title: 'LeetCode 每日一题题解',
        description: 'LeetCode 每日一题题解',
        link: questionUrl,
        item: [
            {
                title: `每日一题-${question.translatedTitle}${diffEmoji}`,
                link: questionUrl,
                description: question.translatedContent,
                pubDate: data.todayRecord[0].date ? parseDate(`${data.todayRecord[0].date}T00:00:00Z`) : undefined,
            },
            ...articleContent.map((art, i) => ({
                title: art.title,
                link: new URL(`solution/${art.slug}`, questionUrl).href,
                description: md.render(handleText(art.content)),
                pubDate: articles[i].node.createdAt ? parseDate(articles[i].node.createdAt) : undefined,
                author: art.author.username,
            })),
        ],
    };
}
