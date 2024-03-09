import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import { config } from '@/config';

export const route: Route = {
    path: '/user/followings/:uid/:loginUid',
    categories: ['social-media'],
    example: '/bilibili/user/followings/2267573/3',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', loginUid: '用于登入的用户id,需要配置对应的 Cookie 值' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['space.bilibili.com/:uid'],
        target: '/user/followings/:uid',
    },
    name: 'UP 主关注用户',
    maintainers: ['Qixingchen'],
    handler,
    description: `:::warning
  UP 主关注用户现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::`,
};

async function handler(ctx) {
    const loginUid = ctx.req.param('loginUid');
    const cookie = config.bilibili.cookies[loginUid];
    if (cookie === undefined) {
        throw new Error('缺少对应 loginUid 的 Bilibili 用户登录后的 Cookie 值 <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">bilibili 用户关注动态系列路由</a>');
    }

    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);

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

    return {
        title: `${name} 的 bilibili 关注`,
        link: `https://space.bilibili.com/${uid}/#/fans/follow`,
        description: `${name} 的 bilibili 关注`,
        item: data.map((item) => ({
            title: `${name} 新关注 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000),
            link: `https://space.bilibili.com/${item.mid}`,
        })),
    };
}
