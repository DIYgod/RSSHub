const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'movie_weekly_best';

    const link = 'https://m.douban.com/movie';
    const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}`;

    const itemResponse = await got({
        method: 'get',
        url: `${apiUrl}/items?start=0&count=10`,
        headers: {
            Referer: link,
        },
    });
    const infoResponse = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: link,
        },
    });

    const data = itemResponse.data.subject_collection_items;

    ctx.state.data = {
        title: infoResponse.data.title,
        link: `https://m.douban.com/subject_collection/${type}`,
        description: infoResponse.data.description,

        item: data.map(({ title, info, cover, cover_url, url, rating, year, release_date, null_rating_reason, description }) => {
            const release = `${year}.${release_date}`;
            const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;
            if (cover && cover.url) {
                cover_url = cover.url;
            }
            description = `标题：${title} <br> 影片信息：${info} <br> 上映日期：${release} <br> 评分：${rate} <br> <img src="${cover_url}"> <p>${description}</p>`;

            return {
                title,
                description,
                link: url,
            };
        }),
    };
};
