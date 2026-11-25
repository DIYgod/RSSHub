import type { Context } from 'hono';

import type { Route } from '@/types';

import { getStories } from './utils';

export const route: Route = {
    path: '/tag/:tag/:type',
    categories: ['reading'],
    example: '/asianfanfics/tag/milklove/N',
    parameters: {
        tag: '标签',
        type: '排序类型',
    },
    name: '标签',
    maintainers: ['KazooTTT'],
    radar: [
        {
            title: '标签 - 最近发布',
            source: ['www.asianfanfics.com/browse/tag/:tag'],
            target: '/tag/:tag/N',
        },
        {
            source: ['www.asianfanfics.com/browse/tag/:tag/:type'],
            target: '/tag/:tag/:type',
        },
    ],
    description: `匹配 asianfanfics 标签，支持排序类型：

- L: Latest 最近更新
- N: Newest 最近发布
- O: Oldest 最早发布
- C: Completed 已完成
- OS: One Shots 短篇`,
    handler,
};

type Type = 'L' | 'N' | 'O' | 'C' | 'OS';

const typeToText = {
    L: '最近更新',
    N: '最近发布',
    O: '最早发布',
    C: '已完成',
    OS: '短篇',
};

const isType = (value: string): value is Type => Object.hasOwn(typeToText, value);

async function handler(ctx: Context) {
    const { tag, type } = ctx.req.param();

    if (!isType(type)) {
        throw new Error('无效的排序类型');
    }
    const data = await getStories(`https://www.asianfanfics.com/browse/tag/${encodeURIComponent(tag)}/${type}`);

    return {
        title: `Asianfanfics - 标签：${tag} - ${typeToText[type]}`,
        ...data,
    };
}
