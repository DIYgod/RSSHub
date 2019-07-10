const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://sspai.com/api/v1/series/page/get?limit=5&sort=weight&offset=0&released_at=0`,
        headers: {
            Host: 'sspai.com',
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: '少数派 -- 最新上架付费专栏',
        link: 'https://sspai.com/series',
        description: '少数派 -- 最新上架付费专栏',
        item: data.map((item) => ({
            title: item.title,
            description: item.summary,
            link: `https://sspai.com/series/${item.id}`,
            author: item.nickname,
        })),
    };
};
