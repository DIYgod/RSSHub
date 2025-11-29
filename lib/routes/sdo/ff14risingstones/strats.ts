import type { Context } from 'hono';

import type { Route } from '@/types';

import { getPosts } from './api';
import { INDEX_URL, LOGO_URL, POST_TYPE, REQUIRE_CONFIG, STRAT_PART } from './constant';
import { checkConfig, generatePostFeeds } from './utils';

export const route: Route = {
    path: '/ff14risingstones/strats/:pid?/:type?',
    example: '/sdo/ff14risingstones/strats/1,2/refine',
    name: '攻略',
    categories: ['bbs'],
    maintainers: ['KarasuShin'],
    features: {
        requireConfig: REQUIRE_CONFIG,
    },
    parameters: {
        pid: {
            description: '分区id，默认显示所有分区，可通过 `,` 拼接多个分区 id 进行筛选',
            default: 'all',
            options: [
                {
                    label: '全部',
                    value: 'all',
                },
                ...STRAT_PART,
            ],
        },
        type: {
            description: '攻略类型，默认不做筛选',
            options: [
                {
                    label: '置顶',
                    value: 'top',
                },
                {
                    label: '精华',
                    value: 'refine',
                },
            ],
        },
    },
    handler,
};

async function handler(ctx: Context) {
    checkConfig();

    const limit = ctx.req.query('limit') || 20;

    const pid =
        ctx.req
            .param('pid')
            ?.split(',')
            .filter((i) => STRAT_PART.some((part) => part.value === i)) ?? [];

    const type = ctx.req.param('type');

    const stratPart = pid.length ? pid.map((i) => STRAT_PART.find((p) => p.value === i)?.label).join('，') : '';

    const posts = await getPosts({
        type: 2,
        limit,
        order: 'latest',
        is_refine: type === 'refine' ? 1 : 0,
        is_top: type === 'top' ? 1 : 0,
        part_id: pid.length ? pid.join(',') : undefined,
    });

    return {
        title: `石之家 - ${POST_TYPE[type] ?? ''}攻略${stratPart ? ` - ${stratPart}` : ''}`,
        link: `${INDEX_URL}#/strat`,
        image: LOGO_URL,
        item: await generatePostFeeds(posts),
    };
}
