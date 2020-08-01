const got = require('@/utils/got');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const res1 = await got({
        method: 'get',
        url: 'https://xueqiu.com/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await got({
        method: 'get',
        url: 'https://xueqiu.com/favorites.json',
        searchParams: queryString.stringify({
            userid: id,
        }),
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const data = res2.data.list;

    ctx.state.data = {
        title: `ID: ${id} 的雪球收藏动态`,
        link: `https://xueqiu.com/u/${id}`,
        description: `ID: ${id} 的雪球收藏动态`,
        item: data.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: new Date(item.created_at).toUTCString(),
            link: `https://xueqiu.com${item.target}`,
        })),
    };
};
