import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, getForumMeta, getThread, getThreads } from './utils';

const renderImages = (images?: string[]) =>
    renderToString(
        <>
            {images?.length ? (
                <>
                    <br />
                    {images.map((image) => (
                        <img src={image.split('?', 1)[0]} alt="" />
                    ))}
                </>
            ) : null}
        </>
    );

const threadTypes = new Set(['all', 'newest', 'hot', 'essence']);

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
    if (!Number.isSafeInteger(topicId) || topicId <= 0) {
        throw new InvalidParameterError('The forum ID must be a positive integer from the forum URL.');
    }
    if (!threadTypes.has(type)) {
        throw new InvalidParameterError('Unsupported thread ordering. Choose all, newest, hot, or essence.');
    }

    const forumMeta = await getForumMeta(topicId);
    if (!forumMeta) {
        throw new InvalidParameterError(`Forum ${topicId} was not found in the current public forum list.`);
    }
    const topicMeta = forumMeta.dataList.find((data) => data.topicId === topicId);
    const threads: Array<DataItem & { tid: number; pubDate: Date }> = (await getThreads(topicId, type)).data.dataList.map((data) => ({
        title: data.title,
        pubDate: parseDate(data.dateline * 1000),
        author: data.userBaseInfo.userName,
        link: `${baseUrl}/post/${data.tid}`,
        tid: data.tid,
    }));

    const limit = getRouteLimit(ctx);
    const sorted = ctx.req.query('sorted') !== 'false';
    const candidates =
        limit === undefined || (sorted && threads.some((item) => !Number.isFinite(item.pubDate.getTime()))) ? threads : (sorted ? threads.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime()) : threads).slice(0, limit);
    const posts = await pMap(
        candidates,
        async (item) => {
            const { tid, ...post } = item;
            const thread = await getThread(tid, topicId);
            if (thread.status.code === 0) {
                const img = renderImages(thread.data.thread.fengTalkImage.length ? thread.data.thread.fengTalkImage : undefined);
                post.description = thread.data.thread.message + img;
            } else {
                throw new Error(`The forum did not provide thread ${tid}: ${thread.status.message} (code ${thread.status.code}). Check that ${post.link} is public.`);
            }
            return post;
        },
        { concurrency: 3 }
    );

    return {
        title: `${topicMeta.topicName} - 社区 - 威锋 - 千万果粉大本营`,
        description: topicMeta.topicDescription,
        link: `${baseUrl}/forum/${topicId}`,
        item: posts,
    };
}
