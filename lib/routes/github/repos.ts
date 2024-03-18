import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import queryString from 'query-string';

export const route: Route = {
    path: '/repos/:user',
    categories: ['programming'],
    example: '/github/repos/DIYgod',
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
    name: 'User Repo',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const response = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/repos`,
        searchParams: queryString.stringify({
            sort: 'created',
        }),
        headers,
    });
    const data = response.data;
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
