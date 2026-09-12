import type { Context } from 'hono';
import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { allowHost } from './common';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

export const route: Route = {
    path: '/release/:namespace/:project/:host?',
    categories: ['programming'],
    example: '/gitlab/release/gitlab-org/gitlab-runner',
    parameters: {
        namespace: 'owner or namespace. `/` needs to be replaced with `%2F`',
        project: 'project name',
        host: 'Gitlab instance hostname, default to gitlab.com',
    },
    name: 'Releases',
    maintainers: ['zoenglinghou'],
    handler,
};

async function handler(ctx: Context) {
    const { namespace, project, host = 'gitlab.com' } = ctx.req.param();
    if (!config.feature.allow_user_supply_unsafe_domain && !allowHost.includes(new URL(`https://${host}/`).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const encodedNamespace = encodeURIComponent(namespace);
    const data = await ofetch(`https://${host}/api/v4/projects/${encodedNamespace}%2F${project}/releases`);

    return {
        title: `${project} - Releases - Gitlab`,
        link: `https://${host}/${namespace}/${project}/-/releases`,
        description: `${namespace}/${project} Releases`,
        item: data.map((item) => ({
            title: item.name,
            author: item.author.name,
            description: md.render(item.description),
            pubDate: parseDate(item.released_at),
            link: item._links.self,
        })),
    };
}
