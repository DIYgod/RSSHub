import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { allowHost } from './common';

export const route: Route = {
    path: '/tag/:namespace/:project/:host?',
    categories: ['programming'],
    example: '/gitlab/tag/rluna-open-source%2Ffile-management%2Fowncloud/core/gitlab.com',
    parameters: {
        namespace: 'owner or namespace. `/` needs to be replaced with `%2F`',
        project: 'project name',
        host: 'Gitlab instance hostname, default to gitlab.com',
    },
    features: {
        antiCrawler: true,
    },
    name: 'Tags',
    maintainers: ['zoenglinghou'],
    handler,
};

async function handler(ctx: Context) {
    const { namespace, project, host = 'gitlab.com' } = ctx.req.param();
    if (!config.feature.allow_user_supply_unsafe_domain && !allowHost.includes(new URL(`https://${host}/`).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const encodedNamespace = encodeURIComponent(namespace);
    const data = await ofetch(`https://${host}/api/v4/projects/${encodedNamespace}%2F${project}/repository/tags`);

    return {
        title: `${project} - Tags - Gitlab`,
        link: `https://${host}/${namespace}/${project}/-/tags`,
        description: `${namespace}/${project} Tags`,
        item: data.map((item) => ({
            title: item.name,
            author: item.commit.author_name,
            description: item.message,
            pubDate: parseDate(item.commit.created_at),
            link: item.commit.web_url,
        })),
    };
}
