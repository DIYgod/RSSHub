import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import { config } from '@/config';
import utils from './utils';

export const route: Route = {
    path: '/followings/video/:uid/:disableEmbed?',
    categories: ['social-media'],
    example: '/bilibili/followings/video/2267573',
    parameters: { uid: '用户 id', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户关注视频动态',
    maintainers: ['LogicJake'],
    handler,
    description: `:::warning
  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::`,
};

async function handler(ctx) {
    const uid = String(ctx.req.param('uid'));
    const disableEmbed = ctx.req.param('disableEmbed');
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new Error('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type=8`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    if (response.data.code === -6) {
        throw new Error('对应 uid 的 Bilibili 用户的 Cookie 已过期');
    }
    const cards = response.data.data.cards;

    const out = cards.map((card) => {
        const card_data = JSON.parse(card.card);

        return {
            title: card_data.title,
            description: `${card_data.desc}${disableEmbed ? '' : `<br><br>${utils.iframe(card_data.aid)}`}<br><img src="${card_data.pic}">`,
            pubDate: new Date(card_data.pubdate * 1000).toUTCString(),
            link: card_data.pubdate > utils.bvidTime && card_data.bvid ? `https://www.bilibili.com/video/${card_data.bvid}` : `https://www.bilibili.com/video/av${card_data.aid}`,
            author: card.desc.user_profile.info.uname,
        };
    });

    return {
        title: `${name} 关注视频动态`,
        link: `https://t.bilibili.com/?tab=8`,
        item: out,
    };
}
