import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { generateNonce, getPost, sign, webBaseUrl } from '../utils';

export const route: Route = {
    path: '/bbs/profile/thread/:userId',
    categories: ['bbs'],
    example: '/dxy/bbs/profile/thread/8335054',
    parameters: { userId: '个人 ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.dxy.cn/bbs/newweb/pc/profile/:userId/threads', 'www.dxy.cn/bbs/newweb/pc/profile/:userId'],
            target: '/bbs/profile/thread/:userId',
        },
        {
            source: ['dxy.cn/bbs/newweb/pc/profile/:userId/threads', 'dxy.cn/bbs/newweb/pc/profile/:userId'],
            target: '/bbs/profile/thread/:userId',
        },
    ],
    name: '个人帖子',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const userId = ctx.req.param('userId');
    const limit = String(getRouteLimit(ctx, 30));

    const userInfo = await cache.tryGet(`dxy:user-info:${userId}`, async () => {
        const userInfoParams = {
            userId,
            serverTimestamp: Date.now(),
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const { data: userInfo } = await got(`${webBaseUrl}/bbs/newweb/personal-page/user-info`, {
            searchParams: {
                ...userInfoParams,
                sign: sign(userInfoParams),
            },
        });
        if (userInfo.code !== 'success') {
            throw new Error(userInfo.message);
        }

        return userInfo.data;
    });

    const postList = await cache.tryGet(
        `dxy:user:post:${userId}:${limit}`,
        async () => {
            const postListParams = {
                userId,
                type: '0',
                pageNum: '1',
                pageSize: limit,
                serverTimestamp: Date.now(),
                timestamp: Date.now(),
                noncestr: generateNonce(8, 'number'),
            };

            const { data: postList } = await got(`${webBaseUrl}/bbs/newweb/user/post/page`, {
                searchParams: {
                    ...postListParams,
                    sign: sign(postListParams),
                },
            });
            if (postList.code !== 'success') {
                throw new Error(postList.message);
            }

            return postList.data;
        },
        config.cache.routeExpire,
        false
    );

    const list = postList.result.map((item) => {
        const { postInfo, createdTime, entityId } = item;
        return {
            title: postInfo.subject,
            description: postInfo.simpleBody,
            pubDate: parseDate(createdTime, 'x'),
            author: postInfo.postUser.nickname,
            category: [postInfo.boardInfo.title],
            link: `${webBaseUrl}/bbs/newweb/pc/post/${entityId}`,
            postId: entityId,
        };
    });

    const items = await pMap(list, (item) => getPost(item), { concurrency: 3 });

    return {
        title: `${userInfo.nickname} 的个人主页 - 丁香园论坛 - 专业医生社区，医学、药学、生命科学、科研学术交流`,
        description: `${userInfo.identificationTitle} ${userInfo.signature}`,
        link: `${webBaseUrl}/bbs/newweb/pc/profile/${userId}/threads`,
        image: userInfo.avatar,
        item: items,
    };
}
