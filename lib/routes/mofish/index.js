import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        query,
        params
    } = ctx;

    const {
        id
    } = params;
    const {
        page = 0
    } = query;

    const url = `https://api.tophub.fun/v2/GetAllInfoGzip?id=${id}&page=${page}`;

    const response = await got({
        method: 'get',
        url,
    });

    const {
        data
    } = response.data.Data;

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
