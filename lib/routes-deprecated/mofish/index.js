const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { renderToString } = require('hono/jsx/dom/server');
const { jsx } = require('hono/jsx');

const renderImageDescription = (imageUrl) =>
    renderToString(
        jsx(
            'p',
            null,
            jsx('img', {
                src: imageUrl,
                referrerpolicy: 'no-referrer',
            }),
            jsx('br', null)
        )
    );

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
            const description = isImage ? renderImageDescription(item.Url) : title;

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
