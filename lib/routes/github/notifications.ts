// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const apiUrl = 'https://api.github.com';
import { config } from '@/config';

export default async (ctx) => {
    if (!config.github || !config.github.access_token) {
        throw new Error('GitHub trending RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${config.github.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
    };

    const response = await got(`${apiUrl}/notifications`, {
        headers,
    });
    const notifications = response.data;

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

    ctx.set('data', {
        title: 'Github Notifications',
        link: 'https://github.com/notifications',
        item: items,
    });

    ctx.set('json', {
        title: 'Github Notifications',
        item: notifications,
        rateLimit: {
            limit: Number.parseInt(response.headers['X-RateLimit-Limit']),
            remaining: Number.parseInt(response.headers['X-RateLimit-Remaining']),
            reset: parseDate(Number.parseInt(response.headers['X-RateLimit-Reset']) * 1000),
            resoure: response.headers['X-RateLimit-Resource'],
            used: Number.parseInt(response.headers['X-RateLimit-Used']),
        },
    });
};
