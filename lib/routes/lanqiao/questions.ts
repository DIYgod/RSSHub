import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const isUnpinnedQuestion = (item) => item.is_toped === false;

export const route: Route = {
    path: '/questions/:id',
    categories: ['programming'],
    example: '/lanqiao/questions/2',
    parameters: { id: 'topic_id 主题 `id` 可在社区板块 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lanqiao.cn/questions/', 'lanqiao.cn/questions/topics/:id'],
        },
    ],
    name: '技术社区',
    maintainers: ['huhuhang'],
    handler,
    url: 'lanqiao.cn/questions/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    // Fetch the source API response.
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/questions/?sort=created_time&topic_id=${id}`,
        headers: {
            Referer: `https://www.lanqiao.cn/questions/topic_id=${id}`,
        },
    });

    const data = response.data.results; // The source API response data.
    const topicName = data[0].topic.name; // Read the topic name.
    // Render Markdown as HTML.
    const md = new MarkdownIt();
    const items = await pMap(
        data.filter(isUnpinnedQuestion),
        (item: { id: number }) =>
            cache.tryGet(`https://www.lanqiao.cn/api/v2/questions/${item.id}/`, async () => {
                const questionResponse = await got({
                    method: 'get',
                    url: `https://www.lanqiao.cn/api/v2/questions/${item.id}/`,
                });
                const question = questionResponse.data;

                return {
                    id: String(item.id),
                    title: question.title,
                    description: md.render(question.content),
                    author: question.author.name,
                    pubDate: parseDate(question.created_at),
                    link: `https://www.lanqiao.cn/questions/${question.id}/`,
                };
            }),
        { concurrency: 3 }
    );
    return {
        // Feed title.
        title: `蓝桥云课技术社区【${topicName}】`,
        // Feed link.
        link: `https://www.lanqiao.cn/questions/topics/${id}/`,
        // Feed description.
        description: `蓝桥云课技术社区【${topicName}】`,
        // Return the collected entries.
        item: items,
    };
}
