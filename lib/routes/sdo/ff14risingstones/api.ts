import cache from '@/utils/cache';

import { API_URL } from './constant';
import type { DutiesPartyDetail, FreeCompanyPartyDetail, NoviceNetworkParty, PostDetail, Resently, UserDynamic, UserInfo, UserPost } from './types';
import { requestAPI } from './utils';

// 获取用户游戏近况
export const getResently = async (uid: string) => await requestAPI<Resently[]>(`${API_URL}/home/userInfo/getResently?uuid=${uid}`);

// 获取用户信息
export const getUserInfo = async (uid: string) => await requestAPI<UserInfo>(`${API_URL}/home/userInfo/getUserInfo?uuid=${uid}`);

// 获取用户帖子
export const getUserPosts = async (uid: string, type: 1 | 2) =>
    await requestAPI<{
        rows: UserPost[];
    }>(`${API_URL}/home/userInfo/getUserPosts?uuid=${uid}&type=${type}`).then((res) => res.rows);

// 获取用户动态
export const getUserDynamic = async (uid: string) =>
    await requestAPI<{
        rows: UserDynamic[];
    }>(`${API_URL}/home/userInfo/getUserDynamic?uuid=${uid}`).then((res) => res.rows);

// 获取帖子详情
export async function getPostsDetail(postID: string) {
    try {
        return await cache.tryGet(`sdo/ff14risingstones/post-detail:${postID}`, async () => await requestAPI<PostDetail>(`${API_URL}/home/posts/postsDetail?id=${postID}`));
    } catch {
        return null;
    }
}

// 获取导芽招募详情
export async function getNoviceNetworkRecruitDetail(recruitID: number) {
    try {
        return await cache.tryGet(`sdo/ff14risingstones/novice-network-recruit-detail:${recruitID}`, async () => await requestAPI<NoviceNetworkParty>(`${API_URL}/home/recruit/getNeDetail?id=${recruitID}`));
    } catch {
        return null;
    }
}

// 获取副本招募详情
export async function getDutiesRecruitDetail(recruitID: number) {
    try {
        return await cache.tryGet(`sdo/ff14risingstones/duties-recruit-detail:${recruitID}`, async () => await requestAPI<DutiesPartyDetail>(`${API_URL}/home/recruit/getRecruitFbDetail?id=${recruitID}`));
    } catch {
        return null;
    }
}

// 获取部队招募详情
export async function getFreeCompanyRecruitDetail(recruitID: number) {
    try {
        return await cache.tryGet(`sdo/ff14risingstones/free-company-recruit-detail:${recruitID}`, async () => await requestAPI<FreeCompanyPartyDetail>(`${API_URL}/home/recruit/getRecruitGuildDetail?id=${recruitID}`));
    } catch {
        return null;
    }
}

// 获取帖文列表
export async function getPosts(params: { type: 1 | 2; is_top?: 0 | 1; is_refine?: 0 | 1; limit?: number | string; order?: string; hotType?: string; part_id?: string }) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            searchParams.set(key, value.toString());
        }
    }

    return await requestAPI<{
        rows: UserPost[];
    }>(`${API_URL}/home/posts/postsList?${searchParams.toString()}`).then((res) => res.rows);
}

// 获取用户关注动态
export const getFollowDynamicList = async (limit: number | string) =>
    await requestAPI<{
        rows: UserDynamic[];
    }>(`${API_URL}/home/dynamic/getFollowDynamicList?limit=${limit}`).then((res) => res.rows);
