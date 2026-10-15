import { escape } from 'entities/escape';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tag/:keyword',
    categories: ['new-media'],
    example: '/sspai/tag/apple',
    parameters: { keyword: '关键词' },
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
            source: ['sspai.com/tag/:keyword'],
        },
    ],
    name: '标签订阅',
    maintainers: ['Jeason0228'],
    handler,
};

interface SourceArticle {
    id: number;
    title: string;
    tags?: Array<{ title: string }>;
    summary: string;
    released_at: number;
    author: { nickname: string };
}

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const keywordEncode = encodeURIComponent(decodeURIComponent(keyword));
    const apiUrl = `https://sspai.com/api/v1/articles?offset=0&limit=50&has_tag=1&tag=${keywordEncode}&include_total=false`;
    const host = `https://beta.sspai.com/tag/${keywordEncode}`;
    const resp = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: host,
        },
    });
    const data: SourceArticle[] = resp.data.list;
    const items = await pMap(
        data,
        async (item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
            let description = '';
            const key = `sspai:tag:body:v3:${item.id}`;
            const resolvedValue1 = await cache.tryGet(key, async () => {
                const response = await got({ method: 'get', url: link, headers: { Referer: host } });
                const articleData = response.data.data;
                const banner = articleData.promote_image;
                if (banner) {
                    description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                }

                if (articleData.body_extends) {
                    for (const ext of articleData.body_extends) {
                        description += `${ext.title ? `<h2>${escape(ext.title)}</h2>` : ''}${ext.body}`;
                    }
                }

                description += articleData.body ?? '';

                return { description: description || undefined };
            });
            {
                const details = resolvedValue1;
                return {
                    title: item.title,
                    link: `https://sspai.com/post/${item.id}`,
                    pubDate: parseDate(item.released_at * 1000),
                    author: item.author.nickname,
                    category: item.tags?.map((tag) => tag.title),
                    description: details.description ?? item.summary,
                };
            }
        },
        { concurrency: 3 }
    );
    return {
        title: `#${keyword} - 少数派`,
        link: host,
        description: `${keyword} 更新推送 `,
        item: items,
    };
}
