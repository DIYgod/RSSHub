import queryString from 'query-string';
import sanitizeHtml from 'sanitize-html';

import { parseToken } from '@/routes/xueqiu/cookies';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hots',
    categories: ['finance'],
    example: '/xueqiu/hots',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/'],
        },
    ],
    name: '热帖',
    maintainers: ['hillerliao'],
    handler,
    url: 'xueqiu.com/',
};

async function handler() {
    const token = await parseToken('https://xueqiu.com');
    const res2 = await got({
        method: 'get',
        url: 'https://api.xueqiu.com/statuses/hot/listV2.json',
        searchParams: queryString.stringify({
            since_id: '-1',
            size: '10',
        }),
        headers: {
            Referer: 'https://xueqiu.com',
            Cookie: token,
        },
    });
    const data = res2.data.items.map((item) => item.original_status);

    return {
        title: '热帖 - 雪球',
        link: 'https://xueqiu.com/',
        description: '雪球热门帖子',
        item: data.map((item) => {
            const description = item.description;
            return {
                title: item.title || item.rawTitle || sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} }),
                description,
                pubDate: parseDate(item.created_at),
                link: `https://xueqiu.com${item.target}`,
                author: item.user.screen_name,
            };
        }),
    };
}
