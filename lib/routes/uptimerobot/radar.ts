export default {
    'uptimerobot.com': {
        _name: 'Uptime Robot',
        rss: [
            {
                title: 'RSS',
                docs: 'https://docs.rsshub.app/routes/forecast#uptime-robot',
                source: ['/:id'],
                target: '/uptimerobot/rss/:id',
            },
        ],
    },
};
