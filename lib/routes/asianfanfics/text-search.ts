import type { Route } from '@/types';

import { getStories } from './utils';

export const route: Route = {
    path: '/text-search/:keyword',
    categories: ['reading'],
    example: '/asianfanfics/text-search/milklove',
    parameters: {
        keyword: '关键词',
    },
    name: '关键词',
    maintainers: ['KazooTTT'],
    radar: [
        {
            source: ['www.asianfanfics.com/browse/search'],
            target: '/text-search/:keyword',
        },
    ],
    description: '匹配 asianfanfics 搜索关键词',
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    if (keyword.trim() === '') {
        throw new Error('关键词不能为空');
    }
    const data = await getStories(`https://www.asianfanfics.com/browse/search?q=${encodeURIComponent(keyword)}`);

    return {
        title: `Asianfanfics - 关键词：${keyword}`,
        ...data,
    };
}
