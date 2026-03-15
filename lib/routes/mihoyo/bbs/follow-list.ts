import type { Route } from '@/types';
import got from '@/utils/got';

import { renderDescription } from '../templates/description';
import cache from './cache';

export const route: Route = {
    path: '/bbs/follow-list/:uid',
    categories: ['game'],
    example: '/mihoyo/bbs/follow-list/77005350',
    parameters: { uid: '用户uid' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '米游社 - 用户关注',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const page_size = ctx.req.query('limit') || '20';
    const searchParams = {
        gids: 2,
        uid,
        page_size,
    };
    const link = `https://www.miyoushe.com/ys/accountCenter/followList?id=${uid}`;
    const url = `https://bbs-api.miyoushe.com/user/wapi/following`;
    const response = await got({
        method: 'get',
        url,
        searchParams,
        headers: {
            Origin: 'https://www.miyoushe.com',
            Referer: link,
        },
    });
    const list = response?.data?.data?.result;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const { nickname: username } = await cache.getUserFullInfo(ctx, uid);
    const title = `米游社 - ${username} 的关注`;
    const items = list.map((e) => {
        const title = e.user.nickname;
        const link = `https://www.miyoushe.com/ys/accountCenter/postList?id=${e.user.uid}`;
        const description = renderDescription(`${e.user.certification.label || ''}\n${e.user.introduce || ''}`.trim(), [e.user.avatar_url]);
        return {
            title,
            link,
            description,
        };
    });

    const data = {
        title,
        link,
        item: items,
    };
    return data;
}
