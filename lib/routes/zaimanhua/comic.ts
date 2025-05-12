import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import cache from '@/utils/cache';
import pMap from 'p-map';

export const route: Route = {
    path: '/comic/:id',
    categories: ['anime'],
    parameters: { id: '漫画ID' },
    example: '/zaimanhua/comic/14488',
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
            source: ['manhua.zaimanhua.com/details', 'manhua.zaimanhua.com/details/:id'],
            target: '/comic/:id',
        },
    ],
    name: '漫画更新',
    maintainers: ['kjasn'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://manhua.zaimanhua.com';
    const id = ctx.req.param('id');
    const currentComicUrl = `${baseUrl}/api/v1/comic2/comic/detail?id=${id}`;

    const response = await ofetch(currentComicUrl, {
        headers: {
            'user-agent': config.trueUA,
            referer: baseUrl,
        },
    });

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
                const chapterResponse = await ofetch(chapterUrl, {
                    headers: {
                        'user-agent': config.trueUA,
                        referer: baseUrl,
                    },
                });

                const chapterData = chapterResponse.data;
                const description = art(path.join(__dirname, 'template/comic.art'), {
                    contents: chapterData.chapterInfo.page_url || [],
                });

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
