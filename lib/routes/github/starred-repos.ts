import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/starred_repos/:user',
    categories: ['programming'],
    example: '/github/starred_repos/DIYgod',
    parameters: { user: 'User name' },
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                optional: true,
                description: 'To get more requests',
            },
        ],
    },
    radar: [
        {
            source: ['github.com/:user'],
        },
    ],
    name: 'User Starred Repositories',
    maintainers: ['LanceZhu'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    const host = `https://github.com/${user}?tab=stars`;

    const { data: response } = await got(`https://api.github.com/users/${user}/starred`, {
        headers: {
            Accept: 'application/vnd.github.star+json',
            Authorization: config.github?.access_token ? `Bearer ${config.github.access_token}` : undefined,
        },
    });

    const data = response.map(({ starred_at, repo }) => ({
        title: `${user} starred ${repo.name}`,
        author: user,
        description: `${repo.description ?? 'No Description'}<br>
        Primary Language: ${repo.language ?? 'Primary Language'}<br>
        Stargazers: ${repo.stargazers_count}<br>
        <img sytle="width:50px;" src="https://opengraph.githubassets.com/${md5(repo.updated_at)}/${repo.full_name}">`,
        pubDate: parseDate(starred_at),
        link: repo.html_url,
        category: repo.topics,
    }));

    return {
        allowEmpty: true,
        title: `${user}'s starred repositories`,
        link: host,
        description: `${user}'s starred repositories`,
        item: data,
    };
}
