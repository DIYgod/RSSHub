const axios = require('../../../utils/axios');

module.exports = async (ctx) => {
    const { type = 'fiction' } = ctx.params;
    const referer = `https://m.douban.com/subject_collection/book_${type}_hot_weekly`;

    const response = await axios({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/subject_collection/book_${type}_hot_weekly/items?start=0&count=10`,
        headers: {
            Referer: referer,
        },
    });

    ctx.state.data = {
        title: `豆瓣热门图书-${type === 'fiction' ? '虚构类' : '非虚构类'}`,
        link: referer,
        description: '每周一更新',
        item: response.data.subject_collection_items.map(({ title, url, cover, info, rating, null_rating_reason }) => {
            const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;
            const description = `<img referrerpolicy="no-referrer" src="${cover.url}"><br>
              ${title}/${info}/${rate}
            `;

            return {
                title: `${title}-${info}`,
                description,
                link: url,
            };
        }),
    };
};
