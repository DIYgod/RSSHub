import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/global/tag/:tag?',
    categories: ['traditional-media'],
    example: '/udn/global/tag/過去24小時',
    parameters: { tag: '标签，可在对应标签页 URL 中找到' },
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
            source: ['global.udn.com/search/tagging/1020/:tag', 'global.udn.com/'],
        },
    ],
    name: '轉角國際 - 標籤',
    maintainers: ['emdoe', 'nczitzk', 'pseudoyu'],
    handler,
    description: `| 過去 24 小時 | 鏡頭背後 | 深度專欄 | 重磅廣播 |
| ------------ | -------- | -------- | -------- |`,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag') ?? '過去24小時';

    const rootUrl = 'https://global.udn.com';
    const currentUrl = `${rootUrl}/search/tagging/1020/${tag}`;
    const apiUrl = `${rootUrl}/global_vision/load/article/newest/tag:${tag}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items: Array<DataItem & { link: string }> = response.data.lists.map((item) => {
        const pubDate = item.time?.dateTime ? parseDate(item.time.dateTime) : undefined;
        return {
            title: item.title,
            author: item.author?.title,
            pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
            link: item.url,
            category: item.hash?.map((h) => h.title),
        };
    });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`udn:global:tag:v3:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const mainImage = content('.article-content__focus').html();
                const articleBodyHtml = content('.article-content__editor')
                    .find('p, figure, h2, .video-container')
                    .toArray()
                    .map((e) => content.html(e))
                    .join('');

                return { description: mainImage + articleBodyHtml };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `轉角國際 udn Global - ${tag}`,
        link: currentUrl,
        item: items,
    };
}
