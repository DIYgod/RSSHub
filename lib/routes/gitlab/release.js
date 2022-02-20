const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { namespace, project, host } = ctx.params;

    const host_ = host ? host : 'gitlab.com';
    const namespace_ = encodeURIComponent(namespace);

    const api_url = `https://${host_}/api/v4/projects/${namespace_}%2F${project}/releases`;

    const response = await got({
        method: 'get',
        url: api_url,
    });
    const data = response.data;

    ctx.state.data = {
        title: `${project} - Releases - Gitlab`,
        link: `https://${host_}/${namespace}/${project}/-/releases`,
        description: `${namespace}/${project} Releases`,
        item: data.map((item) => ({
            title: item.name,
            author: item.author.name,
            description: item.description_html,
            pubDate: parseDate(item.released_at),
            link: item._links.self,
        })),
    };
};
