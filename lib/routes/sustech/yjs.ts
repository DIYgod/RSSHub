import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/sustech/yjs',
    parameters: {},
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
            source: ['gs.sustech.edu.cn/'],
        },
    ],
    name: '研究生网通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'gs.sustech.edu.cn/',
};

interface Article {
    id: number;
    title: string;
    published_at?: string;
    url: string;
    file_items: Array<{ url: string; file_title: string }>;
}

async function handler() {
    const baseUrl = 'https://gs.sustech.edu.cn';
    const link = `${baseUrl}/#/common/index?current_id=99&id=99`;
    const response = await got(`${baseUrl}/api/www/v1/article/list`, {
        searchParams: {
            page: 1,
            pageSize: 20,
            kw: '',
            sort_id: 99,
            cas_sort_id: 99,
        },
    });

    const list: Article[] = response.data.data.items;
    const items = await pMap(
        list,
        async (article) => {
            const item = {
                title: article.title,
                link: `${baseUrl}/#/common/detail?current_id=99&id=99&article_id=${article.id}`,
                pubDate: article.published_at ? parseDateInTimezone(article.published_at, 8) : undefined,
            };
            const resolvedValue1 = await cache.tryGet(item.link, async () => {
                const detail = await got(article.url);
                const description = detail.data.data.content;
                if (typeof description !== 'string') {
                    throw new TypeError(`The announcement has no public article content: ${item.link}`);
                }
                return { description };
            });
            {
                const detail = resolvedValue1;
                return {
                    ...item,
                    description: detail.description + article.file_items.map((file) => `<p><a href="${escapeAttribute(file.url)}">${escapeText(file.file_title)}</a></p>`).join(''),
                };
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '南方科技大学研究生院',
        link,
        description: '南方科技大学研招网通知公告',
        item: items,
    };
}
