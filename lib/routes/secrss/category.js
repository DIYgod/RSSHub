const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api = 'https://www.secrss.com/api/articles?tag=';
    let type = ctx.params.category;
    if (type === undefined) {
        type = '';
    }
    const host = 'https://www.secrss.com';
    const res = await got.get(`${api}${type}`);
    const dataArray = res.data.data;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.summary,
        pubDate: new Date(item.published_at + ' GMT').toUTCString(),
        link: `${host}/articles/${item.id}`,
    }));

    ctx.state.data = {
        title: `安全内参-${type}`,
        link: 'https://www.secrss.com',
        item: items,
    };
};
