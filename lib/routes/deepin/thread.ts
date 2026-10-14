import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/threads/:type?',
    categories: ['bbs'],
    example: '/deepin/threads/latest',
    parameters: {
        type: {
            description: '主题类型',
            options: [
                {
                    value: 'hot',
                    label: '最热主题',
                },
                {
                    value: 'latest',
                    label: '最新主题',
                },
            ],
        },
    },
    name: '首页主题列表',
    maintainers: ['myml'],
    radar: [
        {
            source: ['bbs.deepin.org'],
            target: '/threads/latest',
        },
    ],
    handler,
};

interface ThreadIndexResult {
    ThreadIndex: Array<{
        id: number;
        subject: string;
        created_at: string;
        user: { nickname: string };
        forum: { name: string };
    }>;
}
interface ThreadInfoResult {
    data: {
        id: number;
        subject: string;
        created_at: string;
        user: { nickname: string };
        post: { message: string };
    };
}

const TypeMap = {
    hot: { where: 'hot_value', title: '最热主题' },
    latest: { where: 'id', title: '最新主题' },
};

async function handler(ctx) {
    let type = TypeMap.latest;
    if (ctx.req.param('type') === 'hot') {
        type = TypeMap.hot;
    }
    const res = await ofetch<ThreadIndexResult>('https://bbs.deepin.org/api/v1/thread/index', {
        query: {
            languages: 'zh_CN',
            order: 'updated_at',
            where: type.where,
        },
        headers: {
            accept: 'application/json',
        },
    });
    const orderedThreads = res.ThreadIndex;
    const candidates = orderedThreads;
    const items = await pMap(
        candidates,
        (thread) => {
            const link = 'https://bbs.deepin.org/post/' + thread.id;
            return cache.tryGet(link, async () => {
                const item: DataItem = {
                    id: String(thread.id),
                    title: thread.subject,
                    link,
                    pubDate: parseDate(thread.created_at),
                    author: thread.user.nickname,
                    category: [thread.forum.name],
                    description: '',
                };
                const cacheData = await ofetch<ThreadInfoResult>('https://bbs.deepin.org/api/v1/thread/info?id=' + item.id);
                if (cacheData) {
                    item.description = cacheData.data.post.message;
                }
                return item;
            });
        },
        { concurrency: 3 }
    );
    return {
        title: 'deepin论坛主页 - ' + type.title,
        link: 'https://bbs.deepin.org',
        item: items,
    };
}
