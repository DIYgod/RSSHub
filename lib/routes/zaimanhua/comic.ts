import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderComic } from './template/comic';

export const route: Route = {
    path: '/comic/:id',
    categories: ['anime'],
    parameters: { id: '漫画ID' },
    example: '/zaimanhua/comic/14488',
    features: {
        requireConfig: [
            {
                name: 'ZAIMANHUA_COOKIE',
                optional: true,
                description: '用户登录后，可以从浏览器开发者工具 Network 面板的请求获取 Cookie，如：`SUB=xxx`全部复制并设置为环境变量',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['manhua.zaimanhua.com/details', 'manhua.zaimanhua.com/details/:id'],
            target: '/comic/:id',
        },
    ],
    name: '漫画更新',
    maintainers: ['kjasn'],
    description: `::: Warning
未登录用户无法获取到所有漫画，需要设置\`ZAIMANHUA_COOKIE\`环境变量。
:::`,
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://manhua.zaimanhua.com';
    const id = ctx.req.param('id');
    const currentComicUrl = `${baseUrl}/api/v1/comic2/comic/detail?id=${id}`;

    const headers: Record<string, string> = {
        'user-agent': config.trueUA,
        referer: baseUrl,
    };
    const cookie = config.zaimanhua.cookie;
    if (cookie) {
        headers.cookie = cookie;
    }
    // console.log('look, i got cookie:', cookie);

    const response = await ofetch(currentComicUrl, { headers });

    const comicInfo = response.data.comicInfo;
    const status = comicInfo.chapterList[0].title; // 更新状态
    const data = comicInfo.chapterList[0].data;
    const comicPy = comicInfo.comicPy;
    const comicTitle = comicInfo.title;
    const items = await pMap(
        data,
        async (item) => {
            // 当前漫画章节内容的 API
            const chapterUrl = `${baseUrl}/api/v1/comic2/chapter/detail?comic_id=${id}&chapter_id=${item.chapter_id}`;

            return await cache.tryGet(chapterUrl, async () => {
                // 获取章节内容
                const chapterResponse = await ofetch(chapterUrl, { headers });

                const chapterData = chapterResponse.data;
                const description = renderComic(chapterData.chapterInfo.page_url || []);

                return {
                    title: `[${status}] | ${comicTitle} - ${item.chapter_title}`,
                    category: [status],
                    image: chapterData.chapterInfo.page_url?.[0] || '',
                    link: `${baseUrl}/view/${comicPy}/${id}/${item.chapter_id}`,
                    pubDate: parseDate(item.updatetime * 1000),
                    description,
                };
            });
        },
        { concurrency: 3 }
    );
    return {
        title: `再漫画 - ${comicTitle}`,
        link: `${baseUrl}/details/${id}`,
        item: items,
    };
}
