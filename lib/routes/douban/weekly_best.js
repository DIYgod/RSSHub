const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://m.douban.com/movie';
    const response = await got({
        method: 'get',
        url: 'https://m.douban.com/rexxar/api/v2/subject_collection/movie_weekly_best/items?start=0&count=10',
        headers: {
            Referer: link,
        },
    });

    const data = response.data.subject_collection_items;

    ctx.state.data = {
        title: '豆瓣一周口碑电影榜',
        link: 'https://movie.douban.com/chart',
        description: '每周五更新',

        item: data.map(({ title, info, cover, url, rating, year, release_date, null_rating_reason }) => {
            const release = `${year}.${release_date}`;
            const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;

            const description = `标题：${title} <br> 影片信息：${info} <br> 上映日期：${release} <br> 评分：${rate} <br> <img src="${cover.url}">`;

            return {
                title,
                description,
                link: url,
            };
        }),
    };
};
