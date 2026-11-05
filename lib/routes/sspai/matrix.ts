import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/matrix',
    categories: ['new-media'],
    example: '/sspai/matrix',
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
            source: ['sspai.com/matrix'],
        },
    ],
    name: 'Matrix',
    maintainers: ['feigaoxyz'],
    handler,
    url: 'sspai.com/matrix',
};

interface SourceArticle {
    id: number;
    title: string;
    tags?: Array<{ title: string }>;
    released_at: number;
    author: { nickname: string };
}

async function handler() {
    const api_url = 'https://sspai.com/api/v1/articles?offset=0&limit=20&is_matrix=1&sort=matrix_at&include_total=false';
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data: SourceArticle[] = resp.data.list;
    const items = await pMap(
        data,
        async (item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
            let description = '';

            const key = `sspai:matrix:body:v2:${item.id}`;
            const resolvedValue1 = await cache.tryGet(key, async () => {
                const response = await got(link);
                // description = response.data.data.body;
                const articleData = response.data.data;
                const banner = articleData.promote_image;
                if (banner) {
                    description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                }
                description += articleData.body;

                return { description };
            });
            {
                const details = resolvedValue1;
                return {
                    title: item.title,
                    link: `https://sspai.com/post/${item.id}`,
                    pubDate: parseDate(item.released_at * 1000),
                    author: item.author.nickname,
                    category: item.tags?.map((tag) => tag.title),
                    ...details,
                };
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '少数派 -- Matrix',
        link: 'https://sspai.com/matrix',
        description: '少数派 -- Matrix',
        item: items,
    };
}
