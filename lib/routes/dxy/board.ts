import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { BoardInfo, PostListData } from './types';
import { generateNonce, getPost, phoneBaseUrl, sign, webBaseUrl } from './utils';

export const route: Route = {
    path: '/bbs/board/:boardId',
    categories: ['bbs'],
    example: '/dxy/bbs/board/46',
    parameters: { specialId: '板块 ID，可在对应板块页 URL 中找到' },
    name: '板块',
    maintainers: ['TonyRL'],
    radar: [
        {
            source: ['www.dxy.cn/bbs/newweb/pc/category/:boardIdId'],
            target: '/bbs/board/:boardIdId',
        },
        {
            source: ['3g.dxy.cn/bbs/board/:boardIdId'],
            target: '/bbs/board/:boardIdId',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { boardId } = ctx.req.param();
    const { limit = '20' } = ctx.req.query();

    const boardDetail = (await cache.tryGet(`dxy:board:detail:${boardId}`, async () => {
        const detailParams = {
            boardId,
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const detail = await ofetch(`${phoneBaseUrl}/bbsapi/bbs/board/detail`, {
            query: {
                ...detailParams,
                sign: sign(detailParams),
            },
        });
        if (detail.code !== 'success') {
            throw new Error(detail.message);
        }
        return detail.data;
    })) as BoardInfo;

    const boardList = (await cache.tryGet(
        `dxy:board:list:${boardId}`,
        async () => {
            const listParams = {
                boardId,
                postType: '0',
                orderType: '1',
                pageNum: '1',
                pageSize: limit,
                timestamp: Date.now(),
                noncestr: generateNonce(8, 'number'),
            };

            const recommendList = await ofetch(`${phoneBaseUrl}/bbsapi/bbs/board/post/list`, {
                query: {
                    ...listParams,
                    sign: sign(listParams),
                },
            });
            if (recommendList.code !== 'success') {
                throw new Error(recommendList.message);
            }
            return recommendList.data;
        },
        config.cache.routeExpire,
        false
    )) as PostListData;

    const list = boardList.result.map((item) => ({
        title: item.subject,
        author: item.postUser.nickname,
        category: [boardDetail.title],
        link: `${webBaseUrl}/bbs/newweb/pc/post/${item.postId}`,
        postId: item.postId,
    }));

    const items = await Promise.all(list.map((item) => getPost(item, cache.tryGet)));

    return {
        title: boardDetail.title,
        description: `${boardDetail.postCount} 內容 ${boardDetail.followCount} 关注`,
        link: `${webBaseUrl}/bbs/newweb/pc/category/${boardId}`,
        image: boardDetail.boardAvatar,
        item: items,
    };
}
