const axios = require('@/utils/axios');
const cache = require('./cache');
const config = require('@/config');
const cheerio = require('cheerio');
const request = require('request');

async function get_bilibili_article_contain(url){
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: 'get'
        }, (err, res, body) => {
            if (res && res.statusCode === 200) {
                resolve(body);
            } else {
                reject(' error - -');
            }
        });
    }).then(result => {
        data = result;
        var $ = cheerio.load(data);

        $("img").each(function(i, e) {
            $(e).attr("src", $(e).attr("data-src"));
        });

        return $.html(".article-holder");
    }).catch(err => {
        console.log("error: " + err)
    })
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

            const item = {
                title: card_data.title,
                description: await get_bilibili_article_contain(`http://www.bilibili.com/read/cv${card_data.id}`),
                pubDate: new Date(card_data.publish_time * 1000).toUTCString(),
                link: `https://www.bilibili.com/read/cv${card_data.id}`,
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
