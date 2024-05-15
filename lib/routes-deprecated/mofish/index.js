const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const page = ctx.query.page || 0;

    const url = `https://api.tophub.fun/v2/GetAllInfoGzip?id=${id}&page=${page}`;

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data.Data.data;

    const title = '鱼塘热榜';

    ctx.state.data = {
        title,
        link: 'https://mo.fish/',
        item: data.map((item) => {
            const isImage = Number(id) === 136 && item.Url.endsWith('.gif');
            const description = isImage
                ? art(path.join(__dirname, 'templates/description.art'), {
                      imageUrl: item.Url,
                  })
                : title;

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
