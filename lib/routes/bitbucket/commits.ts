import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import queryString from 'query-string';
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
            source: ['bitbucket.com/commits/:workspace/:repo_slug'],
        },
    ],
    name: 'Commits',
    maintainers: ['AuroraDysis'],
    handler,
};

async function handler(ctx) {
    const workspace = ctx.req.param('workspace');
    const repo_slug = ctx.req.param('repo_slug');

    const headers = {
        Accept: 'application/json',
    };
    let auth = '';
    if (config.bitbucket && config.bitbucket.username && config.bitbucket.password) {
        auth = config.bitbucket.username + ':' + config.bitbucket.password + '@';
    }
    const response = await got({
        method: 'get',
        url: `https://${auth}api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/commits/`,
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
