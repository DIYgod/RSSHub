import type { Context } from 'hono';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Owner Repositories',
    description: 'List of repositories for an image owner',
    maintainers: ['CaoMeiYouRen'],
    path: '/repositories/:owner',
    categories: ['program-update'],
    view: ViewType.Notifications,
    example: '/dockerhub/repositories/diygod',
    parameters: { owner: 'Image owner' },
    handler,
};

async function handler(ctx: Context) {
    const owner = ctx.req.param('owner').toLowerCase();
    const limit = Number.parseInt(ctx.req.query('limit') || '10');
    const link = `https://hub.docker.com/r/${owner}`;
    const url = `https://hub.docker.com/v2/repositories/${owner}`;
    const response = await got(url, {
        searchParams: {
            page_size: limit,
        },
    });
    const item = response.data.results.map((repo) => ({
        title: repo.name,
        description: `${repo.description}<br>status: ${repo.status_description}<br>stars: ${repo.star_count}<br>pulls: ${repo.pull_count}`,
        link: `https://hub.docker.com/r/${owner}/${repo.name}`,
        author: owner,
        pubDate: parseDate(repo.last_updated),
        guid: `${owner}/${repo.name}`,
    }));
    return {
        title: `${owner} repositories`,
        description: `List of repositories for ${owner}`,
        link,
        item,
    };
}
