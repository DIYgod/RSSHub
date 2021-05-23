const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api = 'https://api.anquanke.com/data/v1/posts?size=10&page=1&category=';
    const type = ctx.params.category;
    const host = 'https://www.anquanke.com';
    const res = await got.get(`${api}${type}`);
    const dataArray = res.data.data;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.desc,
        pubDate: item.date,
        link: `${host}/${type === 'week' ? 'week' : 'post'}/id/${item.id}`,
    }));

    ctx.state.data = {
        title: `安全客-${dataArray[0].category_name}`,
        link: 'https://www.anquanke.com',
        item: items,
    };
};
