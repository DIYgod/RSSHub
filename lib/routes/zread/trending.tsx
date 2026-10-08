import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/trending',
    categories: ['programming'],
    example: '/zread/trending',
    name: '热门项目',
    maintainers: ['DIYgod'],
    radar: [{ source: ['zread.ai/trending'], target: '/trending' }],
    description: '订阅当周的热门 GitHub 项目，优先使用源站提供的中文简介。源站没有提供项目进入榜单的时间，因此条目不设置发布日期。',
    handler,
};

interface TrendingRepository {
    owner: string;
    name: string;
    url: string;
    description?: string;
    description_zh?: string;
    topics?: string[];
}

async function handler() {
    const response = await ofetch<{ code: number; msg: string; data: Array<{ repos: TrendingRepository[] }> }>('https://zread.ai/api/v1/public/repo/trending', {
        headers: { 'X-Locale': 'zh' },
    });
    if (response.code !== 0) {
        throw new Error(`Unable to fetch Zread trending repositories: ${response.msg}`);
    }
    return {
        title: 'Zread - 热门项目',
        link: 'https://zread.ai/trending',
        language: 'zh-CN' as const,
        item: (response.data[0]?.repos ?? []).map((repository) => ({
            title: `${repository.owner}/${repository.name}`,
            link: repository.url,
            description: renderToString(<p>{repository.description_zh || repository.description}</p>),
            category: repository.topics,
        })),
    };
}
