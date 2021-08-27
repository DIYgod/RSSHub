const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api = 'https://www.secrss.com/api/articles?tag=';
    const type = ctx.params.category;
    const host = 'https://www.secrss.com';
    const res = await got.get(`${api}${type}`);
    const dataArray = res.data.data;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.summary,
        pubDate: item.published_at,
        link: `${host}/articles/${item.id}`,
    }));

    ctx.state.data = {
        title: `安全内参-${type}`,
        link: 'https://www.secrss.com',
        item: items,
    };
};
