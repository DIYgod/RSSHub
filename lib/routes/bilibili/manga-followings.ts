// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
import { config } from '@/config';

export default async (ctx) => {
    const uid = String(ctx.req.param('uid'));
    const name = await cache.getUsernameFromUID(ctx, uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new Error('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
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
        throw new Error('对应 uid 的 Bilibili 用户的 Cookie 已过期');
    }
    const comics = response.data.data;

    ctx.set('data', {
        title: `${name} 的追漫更新 - 哔哩哔哩漫画`,
        link,
        item: comics.map((item) => ({
            title: `${item.title} ${item.latest_ep_short_title}`,
            description: `<img src='${item.vcover}'>`,
            pubDate: new Date(item.last_ep_publish_time + ' +0800'),
            link: `https://manga.bilibili.com/detail/mc${item.comic_id}`,
        })),
    });
};
