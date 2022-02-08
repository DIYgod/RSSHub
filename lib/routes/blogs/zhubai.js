const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = 20;

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
        title: String(name),
        link: `https://${id}.zhubai.love/`,
        description: String(description),
        item: data.map((item) => ({
            title: item.title,
            pubDate: new Date(item.created_at).toUTCString(),
            link: `https://${id}.zhubai.love/posts/${item.id}`,
            author: name,
        })),
    };
};
