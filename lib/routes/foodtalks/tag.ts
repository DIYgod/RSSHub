import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { namespace } from './namespace';
import { apiBaseUrl, baseUrl, parseList, processItems } from './utils';

export const route: Route = {
    path: '/news/tag/:tagId',
    parameters: {
        tagId: '标签 ID',
    },
    categories: namespace.categories,
    example: '/foodtalks/news/tag/13335',
    radar: [
        {
            source: ['www.foodtalks.cn/news/tag/:tagId'],
        },
    ],
    name: '标签',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.foodtalks.cn',
};

const getTagName = async (tagId: string) => {
    const response = await ofetch(`${apiBaseUrl}/basic/tag/${tagId}?language=ZH`, {
        headers: {
            referer: `${baseUrl}/`,
        },
    });
    if (!response.data) {
        throw new Error('Invalid tagId');
    }
    return response.data.name;
};

async function handler(ctx) {
    const { tagId } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit'), 10) || 15;

    const response = await ofetch(`${apiBaseUrl}/news/news/page`, {
        headers: {
            referer: `${baseUrl}/`,
        },
        query: {
            current: 1,
            size: limit,
            tagId,
            language: 'ZH',
        },
    });

    const tagName = await getTagName(tagId);
    const list = parseList(response.data.records);
    const items = await processItems(list);

    return {
        title: `“${tagName}” 相关资讯-${namespace.name}`,
        description: namespace.description,
        link: `${baseUrl}/news/tag/${tagId}`,
        item: items,
        image: `${baseUrl}/favicon.ico`,
    };
}
