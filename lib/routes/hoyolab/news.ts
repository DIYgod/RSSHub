import path from 'node:path';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { HOST, LINK, NEW_LIST, OFFICIAL_PAGE_TYPE, POST_FULL, PRIVATE_IMG, PUBLIC_IMG } from './constant';
import { getI18nGameInfo, getI18nType } from './utils';

const getEventList = async ({ type, gids, size, language }) => {
    const query = new URLSearchParams({
        type,
        gids,
        page_size: size,
    }).toString();
    const url = `${HOST}${NEW_LIST}?${query}`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            'X-Rpc-Language': language,
        },
    });
    const list = res?.data?.data?.list || [];
    return list;
};

const replaceImgDomain = (content) => content.replaceAll(PRIVATE_IMG, PUBLIC_IMG);

const getPostContent = (list, { language }) =>
    Promise.all(
        list.map(async (row) => {
            const post = row.post;
            const post_id = post.post_id;
            const query = new URLSearchParams({
                post_id,
                language, // language为了区分缓存，对接口并无意义
            }).toString();
            const url = `${HOST}${POST_FULL}?${query}`;
            return await cache.tryGet(url, async () => {
                const res = await got({
                    method: 'get',
                    url,
                    headers: {
                        'X-Rpc-Language': language,
                    },
                });
                const author = res?.data?.data?.post?.user?.nickname || '';
                let content = res?.data?.data?.post?.post?.content || '';
                if (content === language || !content) {
                    content = post.content;
                }
                const description = art(path.join(__dirname, 'templates/post.art'), {
                    hasCover: post.has_cover,
                    coverList: row.cover_list,
                    content: replaceImgDomain(content),
                });
                return {
                    // 文章标题
                    title: post.subject,
                    // 文章链接
                    link: `${LINK}/article/${post_id}`,
                    // 文章正文
                    description,
                    // 文章发布日期
                    pubDate: parseDate(post.created_at * 1000),
                    author,
                };
            });
        })
    );

export const route: Route = {
    path: '/news/:language/:gids/:type',
    categories: ['game'],
    example: '/hoyolab/news/zh-cn/2/2',
    parameters: { language: 'Language', gids: 'Game ID', type: 'Announcement type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Official Announcement',
    maintainers: ['ZenoTian'],
    handler,
    description: `| Language         | Code  |
| ---------------- | ----- |
| 简体中文         | zh-cn |
| 繁體中文         | zh-tw |
| 日本語           | ja-jp |
| 한국어           | ko-kr |
| English (US)     | en-us |
| Español (EU)     | es-es |
| Français         | fr-fr |
| Deutsch          | de-de |
| Русский          | ru-ru |
| Português        | pt-pt |
| Español (Latino) | es-mx |
| Indonesia        | id-id |
| Tiếng Việt       | vi-vn |
| ภาษาไทย          | th-th |

| Honkai Impact 3rd | Genshin Impact | Tears of Themis | HoYoLAB | Honkai: Star Rail | Zenless Zone Zero |
| ----------------- | -------------- | --------------- | ------- | ----------------- | ----------------- |
| 1                 | 2              | 4               | 5       | 6                 | 8                 |

| Notices | Events | Info |
| ------- | ------ | ---- |
| 1       | 2      | 3    |`,
};

async function handler(ctx) {
    try {
        const { type, gids, language } = ctx.req.param();
        const params = {
            type,
            gids,
            language,
            size: Number.parseInt(ctx.req.query('limit')) || 15,
        };
        const gameInfo = await getI18nGameInfo(gids, language, cache.tryGet);
        const typeInfo = await getI18nType(language, cache.tryGet);
        const list = await getEventList(params);
        const items = await getPostContent(list, params);
        return {
            title: `HoYoLAB-${gameInfo.name}-${typeInfo[type].title}`,
            link: `${LINK}/circles/${gids}/${OFFICIAL_PAGE_TYPE[gids]}/official?page_type=${OFFICIAL_PAGE_TYPE[gids]}&page_sort=${typeInfo[type].sort}`,
            item: items,
            image: gameInfo.icon,
            icon: gameInfo.icon,
            logo: gameInfo.icon,
        };
    } catch (error) {
        logger.error(error);
    }
}
