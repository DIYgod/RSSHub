// @ts-nocheck
import got from '@/utils/got';
const { post2item } = require('./utils');

export default async (ctx) => {
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
    ctx.set('data', data);
};
