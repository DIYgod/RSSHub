import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { apiBaseUrl, blogBaseUrl, getBlog, getLimit } from './utils';

export const route: Route = {
    path: '/u/:uid',
    categories: ['programming'],
    example: '/oschina/u/3920392',
    parameters: { uid: '用户 id，可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id' },
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
            source: ['my.oschina.net/u/:uid', 'my.oschina.net/:uid'],
        },
    ],
    name: '用户博客',
    maintainers: ['dxmpalb'],
    handler,
};

interface MedalVo {
    title: string;
    intro: string;
    logoUrl: string;
    term: string;
}

interface UserVo {
    id: number;
    status: number;
    gagForever: boolean;
    gagTime: null;
    gender: number;
    signature: string;
    portraitUrl: string;
    field: never[];
    project: never[];
    level: number;
    activateCode: string;
    ident: string;
    spaceUrl: string;
    spaceName: null;
    recommbBlogger: boolean;
    oscBlogger: boolean;
    followCount: number;
    vermicelliCount: number;
    medals: string[];
    medalVos: MedalVo[];
    name: string;
}

interface UserDetail {
    userId: number;
    userVo: UserVo;
    gender: null;
    ident: string | null;
    email: null;
    experience: number;
    beans: number;
    homeVisitorCount: number;
    blogVisitorCount: number;
    field: never[];
    platform: never[];
    project: never[];
    blogCount: number;
    thinkTankCount: null;
    tweetCount: null;
    aiCreationCount: null;
    signIn: boolean;
}

interface Blog {
    id: number;
    title: string;
    state: number;
    objType: number;
    imgUrl: string;
    detail: string;
    options: null;
    isPrivate: number;
    type: number;
    recomm: number;
    asTop: number;
    createTime: string;
    viewCount: number;
    replyCount: number;
    voteCount: number;
    commentCount: number;
    collected: null;
    userThumbState: null;
    userVo: UserVo;
}

class ContentUnavailableError extends Error {}

async function handler(ctx) {
    const { uid } = ctx.req.param();
    const limit = getLimit(ctx.req.query('limit'), 10);
    const isNumericId = /^\d+$/.test(uid);
    let userId = uid;

    if (!isNumericId) {
        const userByIdent = await cache.tryGet(`oschina:ident:${uid}`, async () => {
            const response = await ofetch<{
                code: number;
                error: boolean;
                message: string;
                result: number;
                success: boolean;
                timestamp: string;
            }>(`${apiBaseUrl}/oschinapi/user/byIdent`, {
                query: {
                    ident: uid,
                },
            });
            return response;
        });
        userId = userByIdent.result;
    }

    const userDetail = await cache.tryGet(`oschina:user:${userId}`, async () => {
        const response = await ofetch<{ result: UserDetail }>(`${apiBaseUrl}/oschinapi/user/userDetails`, {
            query: {
                userId,
            },
        });
        return response.result;
    });

    const blogData = await cache.tryGet(
        `oschina:user:${userId}:blogs:${limit}`,
        async () => {
            const response = await ofetch<{ result: { records: Blog[] } }>(`${apiBaseUrl}/oschinapi/blog/otherUser/web`, {
                query: {
                    userId,
                    pageNum: 1,
                    pageSize: limit,
                },
            });

            return response;
        },
        config.cache.routeExpire,
        false
    );

    const list = blogData.result.records.map((item) => ({
        title: item.title,
        description: item.detail,
        link: `${blogBaseUrl}/u/${userId}/blog/${item.id}`,
        guid: `oschina:blog:${item.id}`,
        detailId: item.id,
        pubDate: timezone(parseDate(item.createTime), 8),
        author: item.userVo.name,
        image: item.imgUrl,
    }));

    const items = await pMap(
        list,
        async (item) => {
            try {
                const description = await cache.tryGet(`oschina:article:body:${item.guid}`, async () => {
                    const response = await getBlog(item.detailId);
                    if (response.code !== 200) {
                        throw new ContentUnavailableError('Blog content is unavailable');
                    }
                    return response.result.content;
                });
                return { ...item, description };
            } catch (error) {
                if (error instanceof ContentUnavailableError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: `${userDetail.userVo.name}的博客`,
        description: userDetail.userVo.signature,
        link: userDetail.userVo.spaceUrl,
        image: userDetail.userVo.portraitUrl.replace('http://', 'https://'),
        language: 'zh-CN' as const,
        item: items,
    };
}
