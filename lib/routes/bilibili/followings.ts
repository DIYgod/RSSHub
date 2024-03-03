// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
import { config } from '@/config';

export default async (ctx) => {
    const loginUid = ctx.req.param('loginUid');
    const cookie = config.bilibili.cookies[loginUid];
    if (cookie === undefined) {
        throw new Error('缺少对应 loginUid 的 Bilibili 用户登录后的 Cookie 值 <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">bilibili 用户关注动态系列路由</a>');
    }

    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(ctx, uid);

    const countResponse = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/stat?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const count = countResponse.data.data.following;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/followings?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    if (response.data.code === -6) {
        throw new Error('对应 loginUid 的 Bilibili 用户的 Cookie 已过期');
    }
    // 22115 : 用户已设置隐私，无法查看
    if (response.data.code === 22115) {
        throw new Error(response.data.message);
    }
    const data = response.data.data.list;

    ctx.set('data', {
        title: `${name} 的 bilibili 关注`,
        link: `https://space.bilibili.com/${uid}/#/fans/follow`,
        description: `${name} 的 bilibili 关注`,
        item: data.map((item) => ({
            title: `${name} 新关注 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000),
            link: `https://space.bilibili.com/${item.mid}`,
        })),
    });
};
