import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { phoneBaseUrl, webBaseUrl, generateNonce, sign, getPost } from './utils';
import { config } from '@/config';
import { RecommendListData, SpecialBoardDetail } from './types';

export const route: Route = {
    path: '/bbs/special/:specialId',
    categories: ['bbs'],
    example: '/dxy/bbs/special/72',
    parameters: { specialId: '专题 ID，可在对应专题页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '专题',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const specialId = ctx.req.param('specialId');
    const { limit = '10' } = ctx.req.query();

    const specialDetail = (await cache.tryGet(`dxy:special:detail:${specialId}`, async () => {
        const detailParams = {
            specialId,
            requestType: 'h5',
            timestamp: Date.now(),
            noncestr: generateNonce(8, 'number'),
        };

        const detail = await ofetch(`${phoneBaseUrl}/newh5/bbs/special/detail`, {
            query: {
                ...detailParams,
                sign: sign(detailParams),
            },
        });
        if (detail.code !== 'success') {
            throw new Error(detail.message);
        }
        return detail.data;
    })) as SpecialBoardDetail;

    const recommendList = (await cache.tryGet(
        `dxy:special:recommend-list-v3:${specialId}`,
        async () => {
            const listParams = {
                specialId,
                requestType: 'h5',
                pageNum: '1',
                pageSize: limit,
                timestamp: Date.now(),
                noncestr: generateNonce(8, 'number'),
            };

            const recommendList = await ofetch(`${phoneBaseUrl}/newh5/bbs/special/post/recommend-list-v3`, {
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
    )) as RecommendListData;

    const list = recommendList.result.map((item) => {
        const { postInfo, dataTime, entityId } = item;
        return {
            title: postInfo.subject,
            description: postInfo.simpleBody,
            pubDate: parseDate(dataTime, 'x'),
            author: postInfo.postUser.nickname,
            category: [postInfo.postSpecial.specialName],
            link: `${webBaseUrl}/bbs/newweb/pc/post/${entityId}`,
            postId: entityId,
        };
    });

    const items = await Promise.all(list.map((item) => getPost(item, cache.tryGet)));

    return {
        title: specialDetail.name,
        description: `${specialDetail.content} ${specialDetail.postCount} 內容 ${specialDetail.followCount} 关注`,
        link: `${phoneBaseUrl}/bbs/special?specialId=${specialId}`,
        image: specialDetail.specialAvatar,
        item: items,
    };
}
