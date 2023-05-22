module.exports = {
    'techpowerup.com': {
        _name: 'TechPowerUp',
        '.': [
            {
                title: 'Latest Content',
                docs: 'https://docs.rsshub.app/en/new-media.html#techpowerup',
                source: ['/'],
                target: '/techpowerup',
            },
            {
                title: 'Reviews',
                docs: 'https://docs.rsshub.app/en/new-media.html#techpowerup',
                source: ['/review/search', '/review'],
                target: (_, url) => `/techpowerup/review${new URL(url).searchParams.has('q') ? `/${new URL(url).searchParams.get('q')}` : ''}`,
            },
        ],
    },
};
