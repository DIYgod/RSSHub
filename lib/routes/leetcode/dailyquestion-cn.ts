import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

const host = 'https://leetcode.cn';

export const route: Route = {
    path: '/dailyquestion/cn',
    radar: [
        {
            source: ['leetcode.cn/'],
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'leetcode.cn/',
};

async function handler() {
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
        query: `query questionOfToday {
            todayRecord {
                date
                question {
                    frontendQuestionId: questionFrontendId
                    titleSlug
                }
            }
        } `,
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
    const data = dailyQuestionResponse.data.data.todayRecord[0];
    question.date = data.date;
    question.titleSlug = data.question.titleSlug;
    question.link = host + '/problems/' + question.titleSlug;

    const detailsPayload = {
        operationName: 'questionData',
        query: `query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                questionFrontendId
                title
                titleSlug
                content
                translatedTitle
                translatedContent
                difficulty
                topicTags {
                    name
                    slug
                    translatedName
                    __typename
                }
                __typename
            }
        }`,
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
    question.content = details.translatedContent;
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

    return {
        title: 'LeetCode 每日一题',
        link: 'https://leetcode.cn',
        description: 'Leetcode 每日一题',
        item: [
            {
                title: rssData.title,
                description: rssData.description + question.content,
                link: rssData.link,
            },
        ],
    };
}
