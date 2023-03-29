const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const apiUrl = 'https://api.github.com';
const config = require('@/config').value;

module.exports = async (ctx) => {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${config.github.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
    };

    const response = await got(`${apiUrl}/notifications`, {
        headers,
    });
    const notifications = response.data;

    const items = notifications.map((item) => ({
        title: item.subject.title,
        description: item.subject.title,
        pubDate: parseDate(item.updated_at), // item.updated_at follows ISO 8601.
        guid: item.id,
        link: item.subject.url,
    }));

    ctx.state.data = {
        title: 'Github Notifications',
        link: 'https://github.com/notifications',
        item: items,
    };

    ctx.state.json = {
        title: 'Github Notifications',
        item: notifications,
        rateLimit: {
            limit: parseInt(response.headers['X-RateLimit-Limit']),
            remaining: parseInt(response.headers['X-RateLimit-Remaining']),
            reset: parseDate(parseInt(response.headers['X-RateLimit-Reset']) * 1000),
            resoure: response.headers['X-RateLimit-Resource'],
            used: parseInt(response.headers['X-RateLimit-Used']),
        },
    };
};
