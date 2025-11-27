import dayjs from 'dayjs';

import type { Route } from '@/types';

import { constructTopicEntry } from './utils';

export const route: Route = {
    path: '/topic/text/:id',
    categories: ['social-media'],
    example: '/jike/topic/text/553870e8e4b0cafb0a1bef68',
    parameters: { id: '圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['web.okjike.com/topic/:id'],
        },
    ],
    name: '圈子 - 纯文字',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const topicUrl = `https://m.okjike.com/topics/${id}`;

    const data = await constructTopicEntry(ctx, topicUrl);

    if (data) {
        const result = data.result;
        result.item = data.posts.map((item) => {
            const date = dayjs(item.createdAt);
            return {
                title: `${data.topic.content} ${date.format('MM月DD日')}`,
                description: item.content.replaceAll('\n', '<br>'),
                pubDate: date.toDate(),
                link: `https://m.okjike.com/originalPosts/${item.id}`,
            };
        });
        return result;
    }
}
