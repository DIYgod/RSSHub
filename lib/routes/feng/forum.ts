// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { parseDate } from '@/utils/parse-date';
const { baseUrl, getForumMeta, getThreads, getThread } = require('./utils');
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `${topicMeta.topicName} - 社区 - 威锋 - 千万果粉大本营`,
        description: topicMeta.topicDescription,
        link: `${baseUrl}/forum/${topicId}`,
        item: posts,
    });
};
