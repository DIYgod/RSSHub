module.exports = {
    'aqara.com': {
        _name: 'Aqara',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/other.html#aqara-news',
                source: ['/news', '/'],
                target: '/aqara/news',
            },
        ],
        community: [
            {
                title: 'Community',
                docs: 'https://docs.rsshub.app/other.html#aqara-community',
                source: ['/pc', '/'],
                target: (params, url) => `/aqara/community/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
