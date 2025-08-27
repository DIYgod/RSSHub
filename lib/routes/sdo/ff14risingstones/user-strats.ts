import type { Data, Route } from '@/types';
import { INDEX_URL, REQUIRE_CONFIG } from './constant';
import type { Context } from 'hono';
import { checkConfig, generatePostFeeds } from './utils';
import { getUserInfo, getUserPosts } from './api';

export const route: Route = {
    path: '/ff14risingstones/user-strats/:uid',
    example: '/sdo/ff14risingstones/user-strats/10001226',
    name: '用户攻略',
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

    const [posts, userInfo] = await Promise.all([getUserPosts(uid, 2), getUserInfo(uid)]);

    return {
        title: `石之家 - ${userInfo.character_name}@${userInfo.group_name} 发布的攻略`,
        link: `${INDEX_URL}#/me/posts?uuid=${uid}`,
        image: userInfo.avatar,
        item: await generatePostFeeds(posts),
    } as Data;
}
