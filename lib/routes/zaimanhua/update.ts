import path from 'node:path';

import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/update',
    categories: ['anime'],
    example: '/zaimanhua/update',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['manhua.zaimanhua.com/update'],
            target: '/update',
        },
    ],
    name: '最近更新',
    maintainers: ['kjasn'],
    handler: async () => {
        const baseUrl = 'https://manhua.zaimanhua.com';
        const currentUrl = `${baseUrl}/api/v1/comic2/update_list?status&theme&zone&cate&firstLetter&sortType&page=1&size=20`;

        const response = await ofetch(currentUrl, {
            headers: {
                'user-agent': config.trueUA,
                referer: baseUrl,
            },
        });

        // 近期更新漫画数据
        const updateData = response.data.comicList;
        const items = await pMap(
            updateData,
            async (item) => {
                const comicId = item.id;
                const lastUpdateChapterId = item.last_update_chapter_id;
                const comicPy = item.comic_py;
                // 当前漫画章节内容的 API
                const chapterUrl = `${baseUrl}/api/v1/comic2/chapter/detail?comic_id=${comicId}&chapter_id=${lastUpdateChapterId}`;

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
                        title: `[${item.status}] | ${item.name} - ${item.last_update_chapter_name}`,
                        author: item.authors,
                        category: [item.status, ...item.types.split('/').map((type) => type.trim())],
                        image: item.cover,
                        link: `${baseUrl}/view/${comicPy}/${comicId}/${lastUpdateChapterId}`,
                        pubDate: parseDate(item.last_updatetime * 1000),
                        description,
                    };
                });
            },
            { concurrency: 3 }
        );

        return {
            title: '再漫画 - 最近更新',
            link: `${baseUrl}/update`,
            item: items,
        };
    },
};
