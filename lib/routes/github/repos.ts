import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';

export const route: Route = {
    path: '/repos/:user/:type?/:sort?',
    categories: ['programming'],
    example: '/github/repos/DIYgod',
    parameters: {
        user: 'GitHub username',
        type: 'Type of repository, can be `all`, `owner`, `member`, `public`, `private`, `forks`, `sources`',
        sort: 'Sort by `created`, `updated`, `pushed`, `full_name`',
    },
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
            source: ['github.com/:user'],
        },
    ],
    name: 'User Repo',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const type = ctx.req.param('type') || 'all';
    const sort = ctx.req.param('sort') || 'created';
    let headers = {};
    if (config.github && config.github.access_token) {
        headers = {
            ...headers,
            Authorization: `token ${config.github.access_token}`,
        };
    }
    const response = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/repos`,
        searchParams: {
            type,
            sort,
        },
        headers,
    });
    const data = response.data.filter((item) => {
        switch (type) {
            case 'all':
                return true;
            case 'owner':
                return item.owner.login === user;
            case 'member':
                return item.owner.login !== user;
            case 'public':
                return item.private === false;
            case 'private':
                return item.private === true;
            case 'forks':
                return item.fork === true;
            case 'sources':
                return item.fork === false;
            default:
                return true;
        }
    });
    return {
        allowEmpty: true,
        title: `${user}'s GitHub repositories`,
        link: `https://github.com/${user}`,
        item:
            data &&
            data.map((item) => ({
                title: item.name,
                description: item.description || 'No description',
                pubDate: new Date(item.created_at).toUTCString(),
                link: item.html_url,
            })),
    };
}
