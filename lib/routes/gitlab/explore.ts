import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { allowHost } from './common';

export const route: Route = {
    path: '/explore/:type?/:host?',
    categories: ['programming'],
    example: '/gitlab/explore/active',
    parameters: {
        type: {
            description: 'Type',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
            ],
            default: 'active',
        },
        host: 'Gitlab instance hostname, default to gitlab.com',
    },
    radar: [
        {
            source: ['gitlab.com/explore/projects/:type'],
            target: '/explore/:type',
        },
    ],
    name: 'Explore',
    maintainers: ['imlonghao', 'zoenglinghou'],
    handler,
    url: 'gitlab.com/explore/projects',
};

async function handler(ctx: Context) {
    const { type = 'active', host = 'gitlab.com' } = ctx.req.param();
    if (!config.feature.allow_user_supply_unsafe_domain && !allowHost.includes(new URL(`https://${host}/`).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const link = `https://${host}/explore/projects/${type}`;
    const response = await ofetch(`https://${host}/api/graphql`, {
        method: 'POST',
        body: {
            operationName: 'exploreProjects',
            variables: {
                first: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20,
                active: type === 'active',
                sort: 'latest_activity_desc',
            },
            query: /* GraphQL */ `
                query exploreProjects($first: Int, $sort: String, $active: Boolean) {
                    projects(first: $first, sort: $sort, active: $active) {
                        nodes {
                            nameWithNamespace
                            webUrl
                            descriptionHtml
                            lastActivityAt
                        }
                    }
                }
            `,
        },
    });

    const items = response.data.projects.nodes.map((project) => ({
        title: project.nameWithNamespace,
        description: project.descriptionHtml,
        link: project.webUrl,
        author: project.nameWithNamespace.split(' / ', 1)[0],
        pubDate: parseDate(project.lastActivityAt),
    }));

    return {
        title: `${type === 'active' ? 'Active' : 'Inactive'} - Explore - Gitlab`,
        link,
        item: items,
    };
}
