const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const response = await got({
        method: 'get',
        url: `https://${id}.zhubai.love/api/publications/${id}/posts?publication_id_type=token&limit=${limit}`,
        headers: {
            Referer: `https://${id}.zhubai.love/`,
        },
    });
    const data = response.data.data;
    const { name, description } = data[0].publication;

    ctx.state.data = {
        title: name,
        link: `https://${id}.zhubai.love/`,
        description,
        item: data.map((item) => ({
            title: item.title,
            pubDate: parseDate(item.created_at),
            link: `https://${id}.zhubai.love/posts/${item.id}`,
            author: name,
        })),
    };
};
