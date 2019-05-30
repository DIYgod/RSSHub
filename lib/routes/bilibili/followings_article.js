const axios = require('@/utils/axios');
const cache = require('./cache');
const config = require('@/config');
const cheerio = require('cheerio');

async function get_bilibili_article_contain(url) {
    const result = await axios.get(url);

    const $ = cheerio.load(result.data);
    $('img').each(function(i, e) {
        $(e).attr('src', $(e).attr('data-src'));
    });

    return $('.article-holder').html();
}

module.exports = async (ctx) => {
    const uid = String(ctx.params.uid);
    const name = await cache.getUsernameFromUID(ctx, uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw Error('缺少对应uid的b站用户登录后的Cookie值');
    }

    const response = await axios({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type=64`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    const cards = response.data.data.cards;

    const out = await Promise.all(
        cards.map(async (card) => {
            const card_data = JSON.parse(card.card);
            const link = `http://www.bilibili.com/read/cv${card_data.id}`;

            const item = {
                title: card_data.title,
                description: await ctx.cache.tryGet(link, async () => await get_bilibili_article_contain(link)),
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
