export default {
    'techpowerup.com': {
        _name: 'TechPowerUp',
        '.': [
            {
                title: 'Latest Content',
                docs: 'https://docs.rsshub.app/routes/new-media#techpowerup',
                source: ['/'],
                target: '/techpowerup',
            },
            {
                title: 'Reviews',
                docs: 'https://docs.rsshub.app/routes/new-media#techpowerup',
                source: ['/review/search', '/review'],
                target: (_, url) => `/techpowerup/review${new URL(url).searchParams.has('q') ? `/${new URL(url).searchParams.get('q')}` : ''}`,
            },
        ],
    },
};
