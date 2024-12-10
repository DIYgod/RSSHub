import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import { config } from '@/config';
import { post2item } from './utils';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/bbs/timeline',
    categories: ['game'],
    example: '/mihoyo/bbs/timeline',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'MIHOYO_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['miyoushe.com/:game/timeline'],
        },
    ],
    name: '米游社 - 用户关注动态',
    maintainers: ['CaoMeiYouRen'],
    handler,
    description: `:::warning
  用户关注动态需要米游社登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::`,
};

async function handler(ctx) {
    if (!config.mihoyo.cookie) {
        throw new ConfigNotFoundError('Miyoushe Timeline is not available due to the absense of [Miyoushe Cookie]. Check <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config tutorial</a>');
    }

    const page_size = ctx.req.query('limit') || '20';
    const searchParams = {
        gids: 2,
        page_size,
    };
    const link = 'https://www.miyoushe.com/ys/timeline';
    const url = 'https://bbs-api.miyoushe.com/painter/wapi/timeline/list';
    const response = await got({
        method: 'get',
        url,
        searchParams,
        headers: {
            Referer: link,
            Cookie: config.mihoyo.cookie,
        },
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const { nickname: username } = await cache.getUserFullInfo(ctx, '');
    const title = `米游社 - ${username} 的关注动态`;
    const items = list.map((e) => post2item(e));

    const data = {
        title,
        link,
        item: items,
    };
    return data;
}
