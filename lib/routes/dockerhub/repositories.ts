import { Context } from 'hono';
import { Data, Route, ViewType } from '@/types';
import utils from './utils';

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
    const { owner, limit } = ctx.req.param();
    const pageSize = Number.isNaN(Number.parseInt(limit)) ? 10 : Number.parseInt(limit);

    const items = await utils.getRepositories(owner, pageSize);
    const link = utils.getOwnerLink(owner);

    return {
        title: `${owner} repositories`,
        description: `List of repositories for ${owner}`,
        link,
        language: 'en',
        item: items.results.map((repo) => {
            const repositoryLink = utils.getRepositoryLink(owner, repo.name);

            return {
                title: repo.name,
                description: `${repo.description}<br>status: ${repo.status_description}<br>stars: ${repo.star_count}<br>pulls: ${repo.pull_count}`,
                link: repositoryLink,
                author: owner,
                pubDate: utils.getPubDate(repo),
                guid: repositoryLink,
            };
        }),
    } as Data;
}
