import type { Data, Route } from '@/types';
import { INDEX_URL, REQUIRE_CONFIG } from './constant';
import type { Context } from 'hono';
import { checkConfig, generateDynamicFeeds } from './utils';
import { getUserDynamic, getUserInfo } from './api';

export const route: Route = {
    path: '/ff14risingstones/user-dynamics/:uid',
    example: '/sdo/ff14risingstones/user-dynamics/10001226',
    name: '用户动态',
    categories: ['bbs'],
    maintainers: ['KarasuShin'],
    features: {
        requireConfig: REQUIRE_CONFIG,
    },
    handler,
};

async function handler(ctx: Context) {
    checkConfig();

    const uid = ctx.req.param('uid');

    const [dynamics, userInfo] = await Promise.all([getUserDynamic(uid), getUserInfo(uid)]);

    return {
        title: `石之家 - ${userInfo.character_name}@${userInfo.group_name} 的动态`,
        link: `${INDEX_URL}#/me/dynamics?uuid=${uid}`,
        image: userInfo.avatar,
        item: await generateDynamicFeeds(dynamics),
    } as Data;
}
