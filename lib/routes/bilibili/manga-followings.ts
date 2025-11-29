import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import got from '@/utils/got';

import cache from './cache';

export const route: Route = {
    path: '/manga/followings/:uid/:limits?',
    categories: ['social-media'],
    example: '/bilibili/manga/followings/26009',
    parameters: { uid: '用户 id', limits: '抓取最近更新前多少本漫画，默认为10' },
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
    name: '用户追漫更新',
    maintainers: ['yindaheng98'],
    handler,
    description: `::: warning
  用户追漫需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

async function handler(ctx) {
    const uid = String(ctx.req.param('uid'));
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }
    const page_size = ctx.req.param('limits') || 10;
    const link = 'https://manga.bilibili.com/account-center';
    const response = await got({
        method: 'POST',
        url: `https://manga.bilibili.com/twirp/bookshelf.v1.Bookshelf/ListFavorite?device=pc&platform=web`,
        json: { page_num: 1, page_size, order: 2, wait_free: 0 },
        headers: {
            Referer: link,
            Cookie: cookie,
        },
    });
    if (response.data.code === -6) {
        throw new ConfigNotFoundError('对应 uid 的 Bilibili 用户的 Cookie 已过期');
    }
    const comics = response.data.data;

    return {
        title: `${name} 的追漫更新 - 哔哩哔哩漫画`,
        link,
        item: comics.map((item) => ({
            title: `${item.title} ${item.latest_ep_short_title}`,
            description: `<img src='${item.vcover}'>`,
            pubDate: new Date(item.last_ep_publish_time + ' +0800'),
            link: `https://manga.bilibili.com/detail/mc${item.comic_id}`,
        })),
    };
}
