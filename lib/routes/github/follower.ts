import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/user/followers/:user',
    categories: ['programming'],
    example: '/github/user/followers/HenryQW',
    parameters: { user: 'GitHub username' },
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
    name: 'User Followers',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    const host = `https://github.com/${user}`;
    const url = `https://api.github.com/users/${user}/followers`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Authorization: config.github?.access_token ? `Bearer ${config.github.access_token}` : undefined,
        },
        searchParams: {
            per_page: 10,
        },
    });

    const data = response.data;

    return {
        title: `${user}'s followers`,
        link: host,
        item: data.map((follower) => ({
            title: `${follower.login} started following ${user}`,
            author: follower.login,
            description: `<a href="https://github.com/${follower.login}">${follower.login}</a> <br> <img sytle="width:50px;" src='${follower.avatar_url}'>`,
            link: follower.html_url,
        })),
    };
}
