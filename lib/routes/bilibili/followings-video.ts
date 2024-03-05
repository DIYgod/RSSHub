// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
import { config } from '@/config';
const utils = require('./utils');

export default async (ctx) => {
    const uid = String(ctx.req.param('uid'));
    const disableEmbed = ctx.req.param('disableEmbed');
    const name = await cache.getUsernameFromUID(ctx, uid);

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

    ctx.set('data', {
        title: `${name} 关注视频动态`,
        link: `https://t.bilibili.com/?tab=8`,
        item: out,
    });
};
