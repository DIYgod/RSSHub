const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const seriesInfo = await got.get(`https://sspai.com/api/v1/series/info/get?id=${id}&view=second`);
    const response = await got(`https://sspai.com/api/v1/series/article/search/page/get?series_id=${id}&weight=0&sort=desc&title=&limit=${ctx.query.limit ? Number(ctx.query.limit) : 40}&offset=0`);

    const items = await Promise.all(
        response.data.data.map(async (item) => {
            let description = '';
            if (item.probation) {
                const res = await got(`https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`);
                description = res.data.data.body;
            } else {
                description = `<img src="https://cdn.sspai.com/${item.banner}">`;
            }

            return {
                title: item.title_prefix + ' - ' + item.title,
                description,
                author: seriesInfo.data.data.author.nickname,
                link: `https://sspai.com/post/${item.id}`,
                pubDate: parseDate(item.created_at * 1000),
            };
        })
    );

    ctx.state.data = {
        title: `${seriesInfo.data.data.title} - 少数派`,
        description: `${seriesInfo.data.data.description} - 少数派`,
        link: `https://sspai.com/series/${id}`,
        item: items,
    };
};
