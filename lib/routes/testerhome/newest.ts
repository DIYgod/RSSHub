import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newest',
    categories: ['programming'],
    example: '/testerhome/newest',
    name: '最新发布',
    maintainers: ['xyqfer'],
    handler,
};

const baseUrl = 'https://testerhome.com';

interface TopicResponse {
    topic: {
        body_html: string;
        created_at?: string;
        updated_at?: string;
        node_name?: string;
        user: { name?: string; login: string };
    };
}

const getTopicDetails = async (item: DataItem): Promise<DataItem> => {
    const topicId = item.link && /\/(?:topics|articles)\/(\d+)$/.exec(new URL(item.link).pathname)?.[1];
    if (!topicId) {
        throw new Error(`Cannot find the public TesterHome topic ID in ${item.link}.`);
    }
    const details = await cache.tryGet(`testerhome:topic:${topicId}`, async () => {
        const response = await ofetch<TopicResponse>(`${baseUrl}/api/v3/topics/${topicId}.json`);
        const topic = response.topic;
        return {
            description: topic.body_html,
            author: topic.user.name || topic.user.login,
            category: topic.node_name ? [topic.node_name] : [],
            createdAt: topic.created_at,
            updatedAt: topic.updated_at,
        };
    });
    return {
        ...item,
        description: details.description,
        author: details.author,
        category: details.category,
        pubDate: details.createdAt ? parseDate(details.createdAt) : undefined,
        updated: details.updatedAt ? parseDate(details.updatedAt) : undefined,
    };
};

async function handler() {
    const response = await ofetch(`${baseUrl}/topics/last`);

    const $ = load(response);
    const resultItem = $('.item-list .topic')
        .toArray()
        .map((elem): DataItem => {
            const $item = $(elem);
            const a = $item.find('.title a');
            const title = a.attr('title') ?? '';

            return {
                title,
                link: new URL(a.attr('href')!, baseUrl).href,
                description: title,
            };
        });

    return {
        title: 'TesterHome-最新发布',
        link: 'https://testerhome.com/topics/last',
        description: 'TesterHome软件测试社区，人气最旺的软件测试技术门户，提供软件测试社区交流，测试沙龙。',
        item: await pMap(resultItem, getTopicDetails, { concurrency: 3, stopOnError: false }),
    };
}
