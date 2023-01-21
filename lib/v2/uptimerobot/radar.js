module.exports = {
    'uptimerobot.com': {
        _name: 'Uptime Robot',
        rss: [
            {
                title: 'RSS',
                docs: 'https://docs.rsshub.app/forecast.html#uptime-robot',
                source: ['/:id'],
                target: '/uptimerobot/rss/:id',
            },
        ],
    },
};
