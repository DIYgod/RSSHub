import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import { config } from '@/config';

export const route: Route = {
    path: '/followings/article/:uid',
    categories: ['social-media'],
    example: '/bilibili/followings/article/99800931',
    parameters: { uid: '用户 id' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户关注专栏',
    maintainers: ['woshiluo'],
    handler,
    description: `:::warning
  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::`,
};

async function handler(ctx) {
    const uid = String(ctx.req.param('uid'));
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new Error('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type=64`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    if (response.data.code === -6) {
        throw new Error('对应 uid 的 Bilibili 用户的 Cookie 已过期');
    }
    const cards = response.data.data.cards;

    const out = await Promise.all(
        cards.map(async (card) => {
            const card_data = JSON.parse(card.card);
            const { url: link, description } = await cache.getArticleDataFromCvid(card_data.id, uid);

            const item = {
                title: card_data.title,
                description,
                pubDate: new Date(card_data.publish_time * 1000).toUTCString(),
                link,
                author: card.desc.user_profile.info.uname,
            };
            return item;
        })
    );

    return {
        title: `${name} 关注专栏动态`,
        link: `https://t.bilibili.com/?tab=64`,
        item: out,
    };
}
