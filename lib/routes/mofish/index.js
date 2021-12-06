const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const page = ctx.query.page || 0;

    const url = `https://api.tophub.fun/v2/GetAllInfoGzip?id=${id}&page=${page}`;

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data.Data.data;

    const title = `鱼塘热榜`;

    ctx.state.data = {
        title,
        link: `https://mo.fish/`,
        description: title,
        item: data.map((item) => ({
            title: item.Title,
            pubDate: new Date(item.releaseTime).toUTCString(),
            link: item.Url,
            guid: item.id,
        })),
    };
};
