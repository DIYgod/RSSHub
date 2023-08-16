module.exports = {
    'aqara.com': {
        _name: 'Aqara',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/other#aqara-news',
                source: ['/news', '/'],
                target: '/aqara/news',
            },
        ],
        community: [
            {
                title: 'Community',
                docs: 'https://docs.rsshub.app/routes/other#aqara-community',
                source: ['/pc', '/'],
                target: (params, url) => `/aqara/community/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
