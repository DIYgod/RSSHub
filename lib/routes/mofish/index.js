const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

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
        item: data.map((item) => {
            const isImage = Number(id) === 136;
            const description = isImage ? `<p><img src="${item.Url}" referrerpolicy="no-referrer"><br></p>` : title;

            return {
                title: item.Title,
                description,
                pubDate: parseDate(item.CreateTime * 1000),
                link: item.Url,
                guid: item.id,
            };
        }),
    };
};
