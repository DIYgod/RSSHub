const got = require('@/utils/got');
const cache = require('./cache');
const config = require('@/config').value;
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uid = String(ctx.params.uid);
    const name = await cache.getUsernameFromUID(ctx, uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw Error('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
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
        throw Error('对应 uid 的 Bilibili 用户的 Cookie 已过期');
    }
    const cards = response.data.data.cards;

    const out = await Promise.all(
        cards.map(async (card) => {
            const card_data = JSON.parse(card.card);
            const link = `http://www.bilibili.com/read/cv${card_data.id}`;

            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);

                const $ = cheerio.load(result.data);

                return $('.article-holder').html();
            });

            const item = {
                title: card_data.title,
                description,
                pubDate: new Date(card_data.publish_time * 1000).toUTCString(),
                link: link,
                author: card.desc.user_profile.info.uname,
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `${name} 关注专栏动态`,
        link: `https://t.bilibili.com/?tab=64`,
        item: out,
    };
};
