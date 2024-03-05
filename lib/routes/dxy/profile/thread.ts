// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { webBaseUrl, generateNonce, sign, getPost } = require('../utils');
import { config } from '@/config';

export default async (ctx) => {
    const userId = ctx.req.param('userId');
    const { limit = '30' } = ctx.req.query();

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
        `dxy:user:post:${userId}`,
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
            category: postInfo.boardInfo.title,
            link: `${webBaseUrl}/bbs/newweb/pc/post/${entityId}`,
            postId: entityId,
        };
    });

    const items = await Promise.all(list.map((item) => getPost(item, cache.tryGet)));

    ctx.set('data', {
        title: `${userInfo.nickname} 的个人主页 - 丁香园论坛 - 专业医生社区，医学、药学、生命科学、科研学术交流`,
        description: `${userInfo.identificationTitle} ${userInfo.signature}`,
        link: `${webBaseUrl}/bbs/newweb/pc/profile/${userId}/threads`,
        image: userInfo.avatar,
        item: items,
    });
};
