import queryString from 'query-string';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tags/:workspace/:repo_slug',
    categories: ['programming'],
    example: '/bitbucket/tags/blaze-lib/blaze',
    parameters: { workspace: 'Workspace', repo_slug: 'Repository' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tags',
    maintainers: ['AuroraDysis'],
    handler,
};

async function handler(ctx) {
    const workspace = ctx.req.param('workspace');
    const repo_slug = ctx.req.param('repo_slug');

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (config.bitbucket && config.bitbucket.username && config.bitbucket.password) {
        headers.Authorization = `Basic ${Buffer.from(`${config.bitbucket.username}:${config.bitbucket.password}`).toString('base64')}`;
    }
    const response = await got({
        method: 'get',
        url: `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/refs/tags/`,
        searchParams: queryString.stringify({
            sort: '-target.date',
        }),
        headers,
    });
    const data = response.data.values;
    return {
        allowEmpty: true,
        title: `Recent Tags in ${workspace}/${repo_slug}`,
        link: `https://bitbucket.org/${workspace}/${repo_slug}`,
        item:
            data &&
            data.map((item) => ({
                title: item.name,
                author: item.tagger?.raw,
                description: item.message || 'No description',
                pubDate: item.date ? parseDate(item.date) : undefined,
                link: item.links.html.href,
            })),
    };
}
