export default {
    'bandcamp.com': {
        _name: 'Bandcamp',
        '.': [
            {
                title: 'Tag',
                docs: 'https://docs.rsshub.app/routes/multimedia#bandcamp',
                source: ['/tag/:tag'],
                target: '/bandcamp/tag/:tag',
            },
            {
                title: 'Upcoming Live Streams',
                docs: 'https://docs.rsshub.app/routes/multimedia#bandcamp-upcoming-live-streams',
                source: ['/live_schedule'],
                target: '/bandcamp/live',
            },
            {
                title: 'Weekly',
                docs: 'https://docs.rsshub.app/routes/multimedia#bandcamp',
                source: ['/'],
                target: '/bandcamp/weekly',
            },
        ],
    },
};
