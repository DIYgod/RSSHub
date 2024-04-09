const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');
const { fallback, queryToInteger } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'subject_real_time_hotest';
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.params.routeParams));
    const playable = fallback(undefined, queryToInteger(routeParams.playable), 0);
    const score = fallback(undefined, queryToInteger(routeParams.score), 0);
    const url = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}/items?playable=${playable}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://m.douban.com/subject_collection/${type}`,
        },
    });
    const description = response.data.subject_collection.description;
    const items = response.data.subject_collection_items
        .filter((item) => {
            const rate = item.rating ? item.rating.value : 0.0;
            return rate >= score; // 保留rate大于等于score的项and过滤无评分项
        })
        .map((item) => {
            const title = item.title;
            const link = item.url;
            const description = art(path.join(__dirname, '../templates/list_description.art'), {
                ranking_value: item.ranking_value,
                title,
                original_title: item.original_title,
                rate: item.rating ? item.rating.value : null,
                card_subtitle: item.card_subtitle,
                description: item.cards ? item.cards[0].content : item.abstract,
                cover: item.cover_url || item.cover?.url,
            });
            return {
                title,
                link,
                description,
            };
        });
    ctx.state.data = {
        title: `豆瓣 - ${response.data.subject_collection.name}`,
        link: `https://m.douban.com/subject_collection/${type}`,
        item: items,
        description,
    };
};
