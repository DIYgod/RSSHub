import type { Data, Route } from '@/types';
import { INDEX_URL, LOGO_URL, REQUIRE_CONFIG } from './constant';
import type { Context } from 'hono';
import { checkConfig, generateDynamicFeeds } from './utils';
import { getFollowDynamicList } from './api';

export const route: Route = {
    path: '/ff14risingstones/timeline',
    example: '/sdo/ff14risingstones/timeline',
    name: '时间线',
    categories: ['bbs'],
    maintainers: ['KarasuShin'],
    features: {
        requireConfig: REQUIRE_CONFIG,
    },
    handler,
};

async function handler(ctx: Context) {
    checkConfig();

    const limit = ctx.req.query('limit') || 20;
    const dynamics = await getFollowDynamicList(limit);

    return {
        title: '石之家 - 时间线',
        link: `${INDEX_URL}#/dynamic`,
        image: LOGO_URL,
        item: await generateDynamicFeeds(dynamics),
    } as Data;
}
