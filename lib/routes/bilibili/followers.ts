import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import got from '@/utils/got';

import cache from './cache';

export const route: Route = {
    path: '/user/followers/:uid/:loginUid',
    categories: ['social-media'],
    example: '/bilibili/user/followers/2267573/3',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', loginUid: '用于登入的用户id,需要配置对应的 Cookie 值' },
    features: {
        requireConfig: [
            {
                name: 'BILIBILI_COOKIE_*',
                description: `BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，\`{uid}\` 替换为 uid，如 \`BILIBILI_COOKIE_2267573\`，获取方式：
1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)
2.  打开控制台，切换到 Network 面板，刷新
3.  点击 dynamic_new 请求，找到 Cookie
4.  视频和专栏，UP 主粉丝及关注只要求 \`SESSDATA\` 字段，动态需复制整段 Cookie`,
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
            source: ['space.bilibili.com/:uid'],
            target: '/user/followers/:uid',
        },
    ],
    name: 'UP 主粉丝',
    maintainers: ['Qixingchen'],
    handler,
    description: `::: warning
  UP 主粉丝现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const loginUid = ctx.req.param('loginUid');

    const cookie = config.bilibili.cookies[loginUid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 loginUid 的 Bilibili 用户登录后的 Cookie 值 <a href="https://docs.rsshub.app/zh/deploy/config#route-specific-configurations">bilibili 用户关注动态系列路由</a>');
    }

    const name = await cache.getUsernameFromUID(uid);

    const countResponse = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/stat?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const count = countResponse.data.data.follower;

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/relation/followers?vmid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    if (response.data.code === -6 || response.data.code === -101) {
        throw new ConfigNotFoundError('对应 loginUid 的 Bilibili 用户的 Cookie 已过期');
    }
    const data = response.data.data.list;

    return {
        title: `${name} 的 bilibili 粉丝`,
        link: `https://space.bilibili.com/${uid}/#/fans/fans`,
        description: `${name} 的 bilibili 粉丝`,
        item: data.map((item) => ({
            title: `${name} 新粉丝 ${item.uname}`,
            description: `${item.uname}<br>${item.sign}<br>总计${count}`,
            pubDate: new Date(item.mtime * 1000),
            link: `https://space.bilibili.com/${item.mid}`,
        })),
    };
}
