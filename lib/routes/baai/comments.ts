import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { baseUrl, apiHost } from './utils';

export const route: Route = {
    path: '/hub/comments',
    categories: ['programming'],
    example: '/baai/hub/comments',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['hub.baai.ac.cn/comments', 'hub.baai.ac.cn/'],
    },
    name: '智源社区 - 评论',
    maintainers: ['TonyRL'],
    handler,
    url: 'hub.baai.ac.cn/comments',
};

async function handler(ctx) {
    const responses = await got.all(
        Array.from(
            {
                // first 2 pages
                length: (ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 12) / 6,
            },
            (_, v) => `${apiHost}/api/v1/commentsall?page=${v + 1}`
        ).map((url) => got.post(url))
    );

    const items = responses
        .flatMap((response) => response.data.data.list)
        .map((item) => ({
            title: `${item.user_info.name} ${item.title_desc} ${item.title}`,
            description: item.desc,
            pubDate: timezone(parseDate(item.created_at), +8),
            author: item.user_info.name,
            link: `${baseUrl}/view/${item.source_id || item.story_id}`,
            guid: `baai:hub:comments:${item.id}`,
        }));

    return {
        title: '评论 - 智源社区',
        link: `${baseUrl}/comments`,
        item: items,
    };
}
