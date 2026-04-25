import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderComic } from './template/comic';

export const route: Route = {
    path: '/update',
    categories: ['anime'],
    example: '/zaimanhua/update',
    features: {
        requireConfig: [
            {
                name: 'ZAIMANHUA_TOKEN',
                optional: true,
                description: '可从浏览器开发者工具中抓取站点请求头 `Authorization` 的 Bearer token，并配置为环境变量。可设置为完整值 `Bearer <token>`，或仅设置 token 由路由自动补齐 `Bearer ` 前缀。',
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
            source: ['manhua.zaimanhua.com/update'],
            target: '/update',
        },
    ],
    name: '最近更新',
    maintainers: ['kjasn'],
    description: `::: Warning
建议设置\`ZAIMANHUA_TOKEN\`环境变量以使用 API 授权访问。且由于源网站本身的限制，建议尽量在部署于中国大陆网络内的 RSSHub 节点中使用本路由。若在海外网络环境中使用，即使设置了\`ZAIMANHUA_TOKEN\`环境变量，也可能无法获取全部漫画。
:::`,
    handler: async () => {
        const baseUrl = 'https://manhua.zaimanhua.com';
        const currentUrl = `${baseUrl}/api/v1/comic2/update_list?status&theme&zone&cate&firstLetter&sortType&page=1&size=20`;
        const headers: Record<string, string> = {
            'user-agent': config.trueUA,
            referer: baseUrl,
        };
        const token = config.zaimanhua.token;
        if (token) {
            headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }

        const response = await ofetch(currentUrl, {
            headers,
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
                    const chapterResponse = await ofetch(chapterUrl, { headers });

                    const chapterData = chapterResponse.data;
                    const description = renderComic(chapterData.chapterInfo.page_url || []);

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
