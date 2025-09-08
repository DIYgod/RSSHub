import { Route } from '@/types';

import { parseDate } from '@/utils/parse-date';
import { baseUrl, getForumMeta, getThreads, getThread } from './utils';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/forum/:id/:type?',
    categories: ['bbs'],
    example: '/feng/forum/1',
    parameters: { id: '版块 ID，可在版块 URL 找到', type: '排序，见下表，默认为 `all`' },
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
            source: ['feng.com/forum/photo/:id', 'feng.com/forum/:id'],
            target: '/forum/:id',
        },
    ],
    name: '社区',
    maintainers: ['TonyRL'],
    handler,
    description: `| 最新回复 | 最新发布 | 热门 | 精华    |
| -------- | -------- | ---- | ------- |
| newest   | all      | hot  | essence |`,
};

async function handler(ctx) {
    const topicId = Number(ctx.req.param('id'));
    const { type = 'all' } = ctx.req.param();

    const forumMeta = await getForumMeta(topicId);
    const topicMeta = forumMeta.dataList.find((data) => data.topicId === topicId);
    const threads = (await getThreads(topicId, type)).data.dataList.map((data) => ({
        title: data.title,
        pubDate: parseDate(data.dateline * 1000),
        author: data.userBaseInfo.userName,
        link: `${baseUrl}/post/${data.tid}`,
        tid: data.tid,
    }));

    const posts = await Promise.all(
        threads.map(async (item) => {
            const thread = await getThread(item.tid, topicId);
            if (thread.status.code === 0) {
                const img = art(path.join(__dirname, 'templates/img.art'), {
                    images: thread.data.thread.fengTalkImage.length ? thread.data.thread.fengTalkImage : undefined,
                });
                item.description = thread.data.thread.message + img;
            } else {
                item.description = art(path.join(__dirname, 'templates/deleted.art'), {});
            }
            delete item.tid;
            return item;
        })
    );

    return {
        title: `${topicMeta.topicName} - 社区 - 威锋 - 千万果粉大本营`,
        description: topicMeta.topicDescription,
        link: `${baseUrl}/forum/${topicId}`,
        item: posts,
    };
}
