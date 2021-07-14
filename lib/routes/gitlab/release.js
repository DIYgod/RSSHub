const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { namespace, project, host } = ctx.params;

    const hostname = host ? host : 'gitlab.com';

    const api_url = `https://${hostname}/api/v4/projects/${namespace}%2F${project}/releases`;

    const response = await got({
        method: 'get',
        url: api_url,
    });
    const data = response.data;

    ctx.state.data = {
        title: `${project} - Releases - Gitlab`,
        link: `https://${host}/${namespace}/${project}/-/releases`,
        description: `${namespace}/${project} Releases`,
        item: data.map((item) => ({
            title: item.name,
            author: item.author.name,
            description: item.description_html,
            pubDate: new Date(item.released_at),
            link: item._links.self,
        })),
    };
};
