import got from '~/utils/got.js';
import {parseDate} from '~/utils/parse-date.js';

export default async (ctx) => {
    const { namespace, project, host } = ctx.params;

    const host_ = host || 'gitlab.com';
    const namespace_ = encodeURIComponent(namespace);

    const api_url = `https://${host_}/api/v4/projects/${namespace_}%2F${project}/repository/tags`;

    const {
        data
    } = await got({
        method: 'get',
        url: api_url,
    });

    ctx.state.data = {
        title: `${project} - Tags - Gitlab`,
        link: `https://${host_}/${namespace}/${project}/-/tags`,
        description: `${namespace}/${project} Tags`,
        item: data.map((item) => ({
            title: item.name,
            author: item.commit.author_name,
            description: item.message,
            pubDate: parseDate(item.commit.created_at),
            link: item.commit.web_url,
        })),
    };
};
