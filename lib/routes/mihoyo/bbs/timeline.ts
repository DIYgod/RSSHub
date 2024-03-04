// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
import { config } from '@/config';
const { post2item } = require('./utils');

export default async (ctx) => {
    if (!config.mihoyo.cookie) {
        throw new Error('Miyoushe Timeline is not available due to the absense of [Miyoushe Cookie]. Check <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config tutorial</a>');
    }

    const page_size = ctx.req.query('limit') || '20';
    const searchParams = {
        gids: 2,
        page_size,
    };
    const link = 'https://www.miyoushe.com/ys/timeline';
    const url = 'https://bbs-api.miyoushe.com/post/wapi/timelines';
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
    ctx.set('data', data);
};
