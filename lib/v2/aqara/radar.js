module.exports = {
    'aqara.com': {
        _name: 'Aqara',
        community: [
            {
                title: 'Community',
                docs: 'https://docs.rsshub.app/other.html#aqara-community',
                source: ['/pc/#/post', '/'],
                target: (params, url) => `/aqara/community/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
