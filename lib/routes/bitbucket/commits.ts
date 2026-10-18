import queryString from 'query-string';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/commits/:workspace/:repo_slug',
    categories: ['programming'],
    example: '/bitbucket/commits/blaze-lib/blaze',
    parameters: { workspace: 'Workspace', repo_slug: 'Repository' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bitbucket.org/:workspace/:repo_slug/commits'],
        },
    ],
    name: 'Commits',
    maintainers: ['AuroraDysis'],
    handler,
};

type RequestHeaders = { Accept: string; Authorization?: string };

async function handler(ctx) {
    const workspace = ctx.req.param('workspace');
    const repo_slug = ctx.req.param('repo_slug');

    const headers: RequestHeaders = {
        Accept: 'application/json',
    };
    if (config.bitbucket && config.bitbucket.username && config.bitbucket.password) {
        headers.Authorization = `Basic ${Buffer.from(`${config.bitbucket.username}:${config.bitbucket.password}`).toString('base64')}`;
    }
    const response = await got({
        method: 'get',
        url: `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/commits/`,
        searchParams: queryString.stringify({
            sort: '-target.date',
        }),
        headers,
    });
    const data = response.data.values;
    return {
        allowEmpty: true,
        title: `Recent Commits to ${workspace}/${repo_slug}`,
        link: `https://bitbucket.org/${workspace}/${repo_slug}`,
        item:
            data &&
            data.map((item) => ({
                title: item.message,
                author: item.author.raw,
                description: item.rendered.message.html || 'No description',
                pubDate: parseDate(item.date),
                link: item.links.html.href,
            })),
    };
}
