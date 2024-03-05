// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
import { config } from '@/config';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');
    const name = await cache.getUsernameFromUID(ctx, uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new Error('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/v2/history/toview`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    if (response.data.code) {
        const message = response.data.code === -6 ? '对应 uid 的 Bilibili 用户的 Cookie 已过期' : response.data.message;
        throw new Error(`Error code ${response.data.code}: ${message}`);
    }
    const list = response.data.data.list || [];

    const out = list.map((item) => ({
        title: item.title,
        description: `${item.desc}<br><br><a href="https://www.bilibili.com/list/watchlater?bvid=${item.bvid}">在稍后再看列表中查看</a>${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
        pubDate: parseDate(item.add_at * 1000),
        link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        author: item.owner.name,
    }));

    ctx.set('data', {
        title: `${name} 稍后再看`,
        link: 'https://www.bilibili.com/watchlater#/list',
        item: out,
    });
};
