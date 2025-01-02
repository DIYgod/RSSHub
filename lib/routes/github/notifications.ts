import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const apiUrl = 'https://api.github.com';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/notifications',
    categories: ['programming'],
    example: '/github/notifications',
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                description: '',
            },
        ],
    },
    radar: [
        {
            source: ['github.com/notifications'],
        },
    ],
    name: 'Notifications',
    maintainers: ['zhzy0077'],
    handler,
    url: 'github.com/notifications',
};

async function handler(ctx) {
    if (!config.github || !config.github.access_token) {
        throw new ConfigNotFoundError('GitHub trending RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${config.github.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
    };

    const response = await ofetch.raw(`${apiUrl}/notifications`, {
        headers,
    });
    const notifications = response._data;

    const items = notifications.map((item) => {
        let originUrl = item.subject.url ? item.subject.url.replace('https://api.github.com/repos/', 'https://github.com/') : 'https://github.com/notifications';
        if (originUrl.includes('/releases/')) {
            originUrl = originUrl.replace(/\/releases\/\d+$/, '/releases');
        }
        return {
            title: item.subject.title,
            description: item.subject.title,
            pubDate: parseDate(item.updated_at), // item.updated_at follows ISO 8601.
            guid: item.id,
            link: originUrl,
        };
    });

    ctx.set('json', {
        title: 'Github Notifications',
        item: notifications,
        rateLimit: {
            limit: Number.parseInt(response.headers['x-ratelimit-limit']),
            remaining: Number.parseInt(response.headers['x-ratelimit-remaining']),
            reset: parseDate(Number.parseInt(response.headers['x-ratelimit-reset']), 'X'),
            resoure: response.headers['x-ratelimit-resource'],
            used: Number.parseInt(response.headers['x-ratelimit-used']),
        },
    });

    return {
        title: 'Github Notifications',
        link: 'https://github.com/notifications',
        item: items,
    };
}
