const got = require('@/utils/got');
const cache = require('./cache');
const config = require('@/config').value;
const utils = require('./utils');

module.exports = async (ctx) => {
    const uid = String(ctx.params.uid);
    const disableEmbed = ctx.params.disableEmbed;
    const name = await cache.getUsernameFromUID(ctx, uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw Error('缺少对应uid的b站用户登录后的Cookie值');
    }

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type=8`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    const cards = response.data.data.cards;

    const out = await Promise.all(
        cards.map(async (card) => {
            const card_data = JSON.parse(card.card);

            const item = {
                title: card_data.title,
                description: `${card_data.desc}${!disableEmbed ? `<br><br>${utils.iframe(card_data.aid)}` : ''}<br><img src="${card_data.pic}">`,
                pubDate: new Date(card_data.pubdate * 1000).toUTCString(),
                link: `https://www.bilibili.com/video/av${card_data.aid}`,
                author: card.desc.user_profile.info.uname,
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `${name} 关注视频动态`,
        link: `https://t.bilibili.com/?tab=8`,
        item: out,
    };
};
