const got = require('@/utils/got');
const weiboUtils = require('./utils');
const date = require('@/utils/date');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const res = await got.get('https://m.weibo.cn/api/container/getIndex', {
        searchParams: queryString.stringify({
            containerid: `${id}_-_feed`,
            luicode: '10000011',
            lfid: `${id}_-_main`,
        }),
        headers: {
            Referer: `https://m.weibo.cn/p/index?containerid=${id}_-_soul&luicode=10000011&lfid=${id}_-_main`,
            'MWeibo-Pwa': '1',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const resultItems = [];

    for (const card of res.data.data.cards) {
        if (!('card_group' in card)) {
            continue;
        }
        for (const mblogCard of card.card_group) {
            if (mblogCard.card_type === '9' && 'mblog' in mblogCard) {
                const mblog = mblogCard.mblog;
                const desc = weiboUtils.format(mblog);
                resultItems.push({
                    title: desc.replace(/<img.*?>/g, '[图片]').replace(/<.*?>/g, ''),
                    description: desc,
                    author: mblog.user.screen_name,
                    link: `https://weibo.com/${mblog.user.id}/${mblog.bid}`,
                    pubDate: date(mblog.created_at, 8),
                });
            }
        }
    }

    ctx.state.data = {
        title: `微博超话 - ${res.data.data.pageInfo.page_title}`,
        link: `https://weibo.com/p/${id}/super_index`,
        description: `#${res.data.data.pageInfo.page_title}# 的超话`,
        item: resultItems,
    };
};
