import { Route } from '@/types';
import got from '@/utils/got';
import { post2item } from './utils';

export const route: Route = {
    path: '/bbs/user-post/:uid',
    categories: ['game'],
    example: '/mihoyo/bbs/user-post/77005350',
    parameters: { uid: '用户uid' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '米游社 - 用户帖子',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const size = ctx.req.query('limit') || '20';
    const searchParams = {
        uid,
        size,
    };
    const link = `https://www.miyoushe.com/ys/accountCenter/postList?id=${uid}`;
    const url = `https://bbs-api.miyoushe.com/post/wapi/userPost`;
    const response = await got({
        method: 'get',
        url,
        searchParams,
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const username = list[0]?.user.nickname;
    const title = `米游社 - ${username} 的发帖`;
    const items = list.map((e) => post2item(e));

    const data = {
        title,
        link,
        item: items,
    };
    return data;
}
